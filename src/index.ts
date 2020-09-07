import { promises } from 'fs';
import dotenv from 'dotenv';
import readline from 'readline';
import { fetchPhotos } from './utils/instagram';

// Set up config file
dotenv.config();

const { IG_HANDLE, IMG_LIMIT, SAVE_LOCATION } = process.env;

// Optional command-line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const fetchAndSaveImages = async (handle: string, limit?: number) => {
  const images = await fetchPhotos({ handle, limit });

  const saveDirectory = SAVE_LOCATION ? SAVE_LOCATION : './images';

  await promises
    .mkdir(saveDirectory, {
      recursive: true,
    })
    .catch(console.error);

  for (let i = 0; i < images.length; i++) {
    await promises
      .writeFile(`${saveDirectory}/${i}.jpg`, images[i], {
        encoding: 'binary',
      })
      .catch(console.error);
  }
};

if (IG_HANDLE) {
  // If config provided fetch images
  fetchAndSaveImages(
    IG_HANDLE,
    !!IMG_LIMIT && IMG_LIMIT !== '' ? parseInt(IMG_LIMIT) : undefined,
  ).then(() => success());
} else {
  // Fetch images after handle provided
  rl.question('What is your instagram handle? ', async (handle) => {
    rl.close();
    fetchAndSaveImages(handle).then(() => success());
  });
}

const success = () => {
  console.log('Finished saving Instagram Photos 🎉');
  process.exit(0);
};

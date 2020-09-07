import axios from 'axios';

const getBase64Image = (url: string) =>
  axios
    .get(url, {
      responseType: 'arraybuffer',
    })
    .then((response) => response.data);

interface IPhotoFetch {
  handle: string;
  limit?: number;
}

export const fetchPhotos = async ({
  handle,
  limit = 5,
}: IPhotoFetch): Promise<string[]> => {
  let mediaArray: string[] = [];
  try {
    const userInfoSource = await axios.get(
      `https://www.instagram.com/${handle}/`,
    );

    const jsonObject = userInfoSource.data
      .match(
        /<script type="text\/javascript">window\._sharedData = (.*)<\/script>/,
      )[1]
      .slice(0, -1);

    const userInfo = JSON.parse(jsonObject);

    const postData = userInfo.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges.splice(
      0,
      limit,
    );

    mediaArray = postData.map(
      (media: { node: { thumbnail_src: string } }) => media.node.thumbnail_src,
    );
  } catch (err) {
    console.error('Unable to retrieve instagram photos', err);
  }
  return await Promise.all(
    mediaArray.map((imageUrl: string) => getBase64Image(imageUrl)),
  );
};

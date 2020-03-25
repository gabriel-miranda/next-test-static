import axios from 'axios';

export default (props) => <div>{props.title}</div>

export async function getExternalData() {
  const { data } = await axios.get('https://beta.taringa.net/api/user/gino/about');
  return data;
}
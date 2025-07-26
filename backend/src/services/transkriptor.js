import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const TRANSKRIPTOR_TOKEN = process.env.TRANSKRIPTOR_TOKEN;
const BASE_URL = 'https://api.tor.app/developer';

export async function uploadAudioToTranskriptor(filePath, fileName) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), fileName);

  const headers = {
    ...form.getHeaders(),
    Authorization: `Bearer ${TRANSKRIPTOR_TOKEN}`,
    Accept: 'application/json',
  };

  const response = await axios.post(`${BASE_URL}/files`, form, { headers });
  return response.data;
}

export async function getTranskriptorFileStatus(fileId) {
  const headers = {
    Authorization: `Bearer ${TRANSKRIPTOR_TOKEN}`,
    Accept: 'application/json',
  };
  const response = await axios.get(`${BASE_URL}/files/${fileId}`, { headers });
  return response.data;
}

export async function getTranskriptorFiles() {
  const headers = {
    Authorization: `Bearer ${TRANSKRIPTOR_TOKEN}`,
    Accept: 'application/json',
  };
  const response = await axios.get(`${BASE_URL}/files`, { headers });
  return response.data;
}

console.log('TRANSKRIPTOR_TOKEN:', process.env.TRANSKRIPTOR_TOKEN);
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: 'https://cm94wa07b0.execute-api.us-east-1.amazonaws.com',
});

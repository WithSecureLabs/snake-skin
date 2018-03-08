import axios from 'axios'

export const API_URL = `http://127.0.0.1:5000/`
export const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Access-Control-Allow-Origin': API_URL
  }
})
export const VERSION = '1.0'

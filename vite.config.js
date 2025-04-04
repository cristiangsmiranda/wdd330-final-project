import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config(); // Carregar variáveis do .env

export default defineConfig({
  root: './streaming-guide', // isso aponta o Vite pro local correto do index.html

});

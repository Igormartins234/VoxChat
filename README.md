# VoxChat AI 🎙️🤖

**VoxChat AI** é uma plataforma de chat interativa e multimodal onde personagens de Inteligência Artificial ganham vida através de voz. Desenvolvido com **React**, **TypeScript** e a poderosa **Google Gemini API**.

![VoxChat AI](https://via.placeholder.com/800x400?text=VoxChat+AI+Preview)

## ✨ Funcionalidades

- **💬 Chat Inteligente**: Converse com diversas personas (Amigável, Sábio, Cínico, etc.) alimentadas pelo modelo `gemini-2.5-flash`.
- **🗣️ Texto-para-Fala (TTS)**: Converta qualquer texto em áudio realista instantaneamente usando o modelo `gemini-2.5-flash-preview-tts`.
- **📸 Visão Multimodal**: Envie imagens para a IA analisar e comentar durante a conversa.
- **🎧 Player de Áudio Avançado**: Controles de Play/Pause, visualizador de áudio e download de arquivos `.wav`.
- **💾 Histórico**: Baixe a transcrição completa da conversa em `.txt`.
- **🔑 Gerenciamento de Chaves**: Sistema robusto de rotação de chaves de API para evitar interrupções.
- **🎨 UI Responsiva**: Interface moderna e adaptável para Desktop e Mobile construída com Tailwind CSS.

## 🚀 Como Iniciar

### Pré-requisitos

- Node.js (v18 ou superior)
- Uma chave de API do [Google AI Studio](https://aistudio.google.com/)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/voxchat-ai.git
   cd voxchat-ai
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

### Configuração da API

Você tem duas formas de configurar suas chaves de API:

**Opção 1: Variável de Ambiente (Recomendado)**
Crie um arquivo `.env` na raiz do projeto:
```env
API_KEY=sua_chave_api_principal_aqui
```

**Opção 2: Rotação de Chaves (api.json)**
Para maior resiliência, você pode adicionar chaves extras no arquivo `api.json`. Se a chave principal falhar (ex: cota excedida), o sistema tentará usar estas chaves automaticamente.

Edite o arquivo `api.json`:
```json
{
  "keys": [
    "chave_reserva_1",
    "chave_reserva_2"
  ]
}
```

### Rodando o Projeto

Inicie o servidor de desenvolvimento:
```bash
npm start
```
O aplicativo estará disponível em `http://localhost:3000` (ou porta similar).

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript
- **Estilização**: Tailwind CSS
- **IA Generativa**: Google GenAI SDK (`@google/genai`)
  - *Chat/Vision*: `gemini-2.5-flash`
  - *Áudio*: `gemini-2.5-flash-preview-tts`
- **Áudio**: Web Audio API (Processamento de PCM Raw)

## 📝 Licença

Este projeto é de uso livre para fins educacionais.

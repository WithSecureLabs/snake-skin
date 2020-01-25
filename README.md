# Snake Skin

Snake Skin is the Web UI for Snake.

## Install

Requirements:
> nodejs
> npm

### Developement

To run Snake Skin for development, execute the following:

```
npm install
npm run dev
```

### Production

To run Snake Skin for production, execute the following:

```
npm install
NODE_ENV=production npm run build
npm prune --production
npm start
```

### Docker

To build Snake Skin for Docker, execute the following:

```
docker build -t countercept/snake-skin . -f Dockerfile
```

## Configuration

Snake Skin current supports the following configuration changes through environment variables:

Variable | Default
--- | ---
SNAKE_SKIN_SNAKE_API | `http://localhost:5000`

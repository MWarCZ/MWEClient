# MWEClient

## Zprovoznění

### Prerekvizity
- Operační systém
  - _Linux_ 
  - _WSL_ či _WSL 2_ pro Windows 10 
- Node.js verze 10 a vyšší
- Yarn nebo NPM
- Server(y) 
  1. Server [MWEServer](https://github.com/MWarCZ/MWEServer)
  2. Webový server (Pouze pro nasazení produkční verze)
    - Testováno na _Nginx 1.10.3_

### Nastavení
1. Instalace všech závislostí 
```
yarn install
```
2. Nastavení připojení k serveru MWE (Nastavení GraphQL)
   - Nastavení pro vývoj se nachází v souboru [.env](.env).
   - Nastavení pro produkční verzi se nachází v souboru [.env.production](.env.production).
3. Nastavení nástroje vue-cli pro výslednou klientskou aplikace 
   - Nalézá se v souboru [vue.config.js](vue.config.js).
   - Pro produkční vezi je podstatné nastavení `publicPath`.
   - Více o možných nastavení na webu [cli.vuejs.org](https://cli.vuejs.org/config/).

### Kompilace a server pro vývoj
1. Spuštení serveru pro vývoj s hlídáním změn a automatickou kompilací
```
yarn serve
```

### Vytvoření produkční verze
1. Spuštení kompilace a optimalizace produkční verze aplikace
```
yarn build
```
2. Výsledná produkční verze se nalézá ve složce `dist/`

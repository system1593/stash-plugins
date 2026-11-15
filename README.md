# stash-plugins

Plugin personali per [Stash](https://github.com/stashapp/stash), pubblicati come *source index* installabile da Stash.

## Plugin

| Plugin | Versione | Cosa fa |
|---|---|---|
| [Auto Tag Pair](plugins/auto-tag-pair/README.md) | 1.1.0 | Aggiunge tag alle scene in base allo stash-box usato per identificarle (StashDB, ThePornDB, FansDB) |

## Installazione in Stash

1. **Settings → Plugins → Available Plugins → Add source**
2. Source URL: `https://system1593.github.io/stash-plugins/main/index.yml`
3. Installa il plugin dall'elenco della sorgente.

## Repository

- **Principale (Forgejo):** https://git.alexpruteanu.ovh/system15/stash-plugins: qui si fanno commit e push.
- **Copia (GitHub):** https://github.com/system1593/stash-plugins: aggiornata da Forgejo con un push mirror. Non modificarla direttamente: viene sovrascritta a ogni sincronizzazione.

A ogni push che tocca `plugins/**`, la GitHub Action [`deploy.yml`](.github/workflows/deploy.yml) esegue [`build_site.sh`](build_site.sh) e pubblica su GitHub Pages lo zip di ogni plugin e `index.yml`.

## Creare un plugin

Ogni plugin va in una cartella dentro [`plugins/`](plugins), con il suo file `.yml`. Guida ufficiale: [Creating plugins](https://docs.stashapp.cc/in-app-manual/plugins/#creating-plugins).

Repository creato dal template ufficiale di Stash per i source index.

## Licenza

Licenza del repository: [AGPL-3.0](LICENCE).

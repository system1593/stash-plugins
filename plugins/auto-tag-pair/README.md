# Auto Tag Pair — StashApp Plugin

Plugin embedded JavaScript per [StashApp](https://github.com/stashapp/stash) che aggiunge automaticamente tag alle scene in base allo stash-box usato per identificarle.

## Funzionalità

- Aggiunge tag automaticamente al momento dell'identificazione tramite stash-box
- I tag **non vengono rimessi** se rimossi manualmente in seguito
- Include un task manuale per processare tutte le scene già esistenti
- Compatibile con StashApp v0.31.x

## Mappatura stash-box → tag

| Stash-box | Tag aggiunti |
|---|---|
| [StashDB](https://stashdb.org) | `01-Fatto` · `02-Controllate Manualmente` |
| [ThePornDB](https://theporndb.net) | `01-Fatto` · `02-Controllate Manualmente` · `03-ThePornDB` |
| [FansDB / OnlyFans](https://fansdb.cc) | `01-Fatto` · `02-Controllate Manualmente` · `05-OnlyFans` |

I tag vengono creati automaticamente se non esistono.

## Installazione

1. Copia la cartella `auto-tag-pair/` nella directory `plugins` di StashApp:
   - **Windows:** `%USERPROFILE%\.stash\plugins\`
   - **Linux/Mac:** `~/.stash/plugins/`
   - **Docker/Unraid:** nella cartella mappata come `/config/plugins/`

2. La struttura deve essere:
   ```
   plugins/
   └── auto-tag-pair/
       ├── auto-tag-pair.yml
       └── index.js
   ```

3. In StashApp vai in **Settings → Plugins** e clicca **Reload Plugins**

4. Il plugin "Auto Tag Pair" comparirà nella lista con lo stato attivo

## Utilizzo

### Automatico (hook)
Il plugin si attiva da solo ogni volta che identifichi una scena tramite stash-box (Identify o scraping manuale). Non è necessario fare nulla.

### Task manuale
Per applicare i tag a tutte le scene già esistenti:

1. Vai in **Settings → Tasks** (con **Advanced mode** attivo)
2. Scorri fino a **Plugin Tasks**
3. Clicca **"Processa tutte le scene"**

## Personalizzazione

Per modificare la mappatura stash-box → tag, modifica l'oggetto `scraperTagMap` in `index.js`:

```javascript
var scraperTagMap = {
    "https://stashdb.org/graphql": [
        "01-Fatto",
        "02-Controllate Manualmente"
    ],
    "https://theporndb.net/graphql": [
        "01-Fatto",
        "02-Controllate Manualmente",
        "03-ThePornDB"
    ],
    "https://fansdb.cc/graphql": [
        "01-Fatto",
        "02-Controllate Manualmente",
        "05-OnlyFans"
    ]
};
```

Aggiungi o modifica le voci secondo le tue esigenze. L'URL deve corrispondere esattamente all'endpoint GraphQL del tuo stash-box (visibile in **Settings → Metadata Providers**).

## Requisiti

- StashApp v0.27.0 o superiore
- Almeno uno stash-box configurato in Settings → Metadata Providers

## Note tecniche

Il plugin è scritto in JavaScript ES5 per compatibilità con il motore [otto](https://github.com/robertkrimen/otto) integrato in StashApp. Non usa `async/await`, `const/let` o altre funzionalità ES6+.

## Licenza

MIT

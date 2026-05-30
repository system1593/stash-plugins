// Plugin Auto Tag Pair per StashApp (motore otto, ES5)

log.Info("[AutoTagPair] Plugin avviato");

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

function getOrCreateTag(name) {
    var findResult = gql.Do(
        "query FindTags($filter: TagFilterType) { findTags(tag_filter: $filter) { tags { id name } } }",
        { filter: { name: { value: name, modifier: "EQUALS" } } }
    );
    if (findResult.findTags && findResult.findTags.tags && findResult.findTags.tags.length > 0) {
        return findResult.findTags.tags[0].id;
    }
    var createResult = gql.Do(
        "mutation TagCreate($input: TagCreateInput!) { tagCreate(input: $input) { id } }",
        { input: { name: name } }
    );
    if (createResult.tagCreate) {
        log.Info("[AutoTagPair] Creato tag: " + name);
        return createResult.tagCreate.id;
    }
    return null;
}

function fetchScene(sceneId) {
    var result = gql.Do(
        "query FindScene($id: ID!) { findScene(id: $id) { id tags { id name } stash_ids { stash_id endpoint } } }",
        { id: sceneId }
    );
    return result.findScene;
}

function addTagsForEndpoint(scene, endpoint) {
    if (!scraperTagMap[endpoint]) {
        log.Info("[AutoTagPair] Endpoint non mappato: " + endpoint);
        return false;
    }

    var existingTagIds = [];
    var i;
    if (scene.tags) {
        for (i = 0; i < scene.tags.length; i++) {
            existingTagIds.push(scene.tags[i].id);
        }
    }

    var tagsToAdd = [];
    var tagsForEndpoint = scraperTagMap[endpoint];
    for (i = 0; i < tagsForEndpoint.length; i++) {
        var tagId = getOrCreateTag(tagsForEndpoint[i]);
        if (tagId && existingTagIds.indexOf(tagId) === -1 && tagsToAdd.indexOf(tagId) === -1) {
            tagsToAdd.push(tagId);
        }
    }

    if (tagsToAdd.length === 0) {
        log.Info("[AutoTagPair] Tag gia presenti per " + endpoint);
        return false;
    }

    var allTagIds = existingTagIds.concat(tagsToAdd);
    gql.Do(
        "mutation SceneUpdate($input: SceneUpdateInput!) { sceneUpdate(input: $input) { id } }",
        { input: { id: scene.id, tag_ids: allTagIds } }
    );
    log.Info("[AutoTagPair] Scena " + scene.id + ": aggiunti " + tagsToAdd.length + " tag per " + endpoint);
    return true;
}

function processAllScenes() {
    log.Info("[AutoTagPair] TASK: scansione tutte le scene");
    var result = gql.Do(
        "query AllScenes { findScenes(filter: { per_page: -1 }) { scenes { id tags { id name } stash_ids { stash_id endpoint } } } }",
        {}
    );
    if (!result.findScenes || !result.findScenes.scenes) {
        log.Info("[AutoTagPair] Nessuna scena trovata");
        return;
    }
    var scenes = result.findScenes.scenes;
    log.Info("[AutoTagPair] Trovate " + scenes.length + " scene");
    var count = 0;
    for (var i = 0; i < scenes.length; i++) {
        var s = scenes[i];
        if (!s.stash_ids || s.stash_ids.length === 0) { continue; }
        // Nel task usa tutti gli stash_ids della scena
        var modified = false;
        for (var j = 0; j < s.stash_ids.length; j++) {
            if (addTagsForEndpoint(s, s.stash_ids[j].endpoint)) {
                modified = true;
                // Ricarica la scena dopo la modifica per avere i tag aggiornati
                s = fetchScene(s.id);
            }
        }
        if (modified) { count++; }
    }
    log.Info("[AutoTagPair] Completato: " + count + " scene modificate");
}

function main() {
    if (input.args && input.args.mode === "all") {
        log.Info("[AutoTagPair] Esecuzione task manuale");
        processAllScenes();
        return { Output: "ok" };
    }

    if (input.Args && input.Args.hookContext) {
        var hookContext = input.Args.hookContext;
        var sceneId = hookContext.id;

        // Agisci solo se stash_ids e' stato modificato
        var inputFields = hookContext.inputFields;
        var stashIdsModified = false;
        if (inputFields) {
            for (var f = 0; f < inputFields.length; f++) {
                if (inputFields[f] === "stash_ids") {
                    stashIdsModified = true;
                    break;
                }
            }
        }

        if (!stashIdsModified) {
            log.Info("[AutoTagPair] Modifica senza stash_ids, skip");
            return { Output: "skip" };
        }

        // Usa SOLO l'ultimo stash_id nell'input: e' quello appena aggiunto
        var inputStashIds = (hookContext.input && hookContext.input.stash_ids)
            ? hookContext.input.stash_ids
            : null;

        if (!inputStashIds || inputStashIds.length === 0) {
            log.Info("[AutoTagPair] Nessun stash_id nell'input, skip");
            return { Output: "skip" };
        }

        // L'endpoint appena usato e' l'ULTIMO nella lista
        var lastStashId = inputStashIds[inputStashIds.length - 1];
        var endpoint = lastStashId.endpoint;
        log.Info("[AutoTagPair] Identificazione con: " + endpoint);

        var scene = fetchScene(sceneId);
        addTagsForEndpoint(scene, endpoint);
        return { Output: "ok" };
    }

    log.Info("[AutoTagPair] Contesto non riconoscibile, skip");
    return { Output: "skip" };
}

main();

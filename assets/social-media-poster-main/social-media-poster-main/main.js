const NotionHandler = require('./handlers/NotionHandler');
const FacebookHandler = require('./handlers/FacebookHandler');
const InstagramHandler = require('./handlers/InstagramHandler');
const Logger = require('./Logger');
const config = require('./config');
const fs = require('fs').promises;
const path = require('path');

const LOCK_FILE = path.join(__dirname, 'script.lock');

async function createLockFile() {
    try {
        await fs.writeFile(LOCK_FILE, 'locked', { flag: 'wx' });
        return true;
    } catch (error) {
        if (error.code === 'EEXIST') {
            return false;
        }
        throw error;
    }
}

async function removeLockFile() {
    try {
        await fs.unlink(LOCK_FILE);
    } catch (error) {
        console.error('Error removing lock file:', error);
    }
}

async function main() {
    if (!(await createLockFile())) {
        console.log('Another instance is already running. Exiting.');
        return;
    }

    const logger = new Logger(config.log_file);
    const notion = new NotionHandler(config.notion, logger);
    const facebook = new FacebookHandler(config.facebook, logger);
    const instagram = new InstagramHandler(config.facebook, logger);

    try {
        await logger.log('Script started.');

        const publications = await notion.getPublicationsToPost();

        for (const publication of publications) {
            const pageId = publication.id;
            const properties = publication.properties;
            
            const socialNetworks = properties['Réseaux'].multi_select.map(item => item.name);
            
            const facebookPageToken = properties['data_facebook_page_token']?.rollup?.array[0]?.rich_text[0]?.plain_text;
            const facebookPageId = properties['data_facebook_page_id']?.rollup?.array[0]?.rich_text[0]?.plain_text;
            const instagramPageId = properties['data_instagram_page_id']?.rollup?.array[0]?.rich_text[0]?.plain_text;

            let hasError = false;

            const tasks = [];

            // Facebook Post
            if (socialNetworks.includes('Post Facebook') && facebookPageId && facebookPageToken) {
                tasks.push(handleFacebookPost(facebook, notion, pageId, properties, facebookPageId, facebookPageToken));
            }

            // Instagram Post
            if (socialNetworks.includes('Post Instagram') && instagramPageId && facebookPageToken) {
                tasks.push(handleInstagramPost(instagram, notion, pageId, properties, instagramPageId, facebookPageToken));
            }

            // Facebook Story
            if (socialNetworks.includes('Story Facebook') && facebookPageId && facebookPageToken) {
                tasks.push(handleFacebookStory(facebook, notion, pageId, properties, facebookPageId, facebookPageToken));
            }

            // Instagram Story
            if (socialNetworks.includes('Story Instagram') && instagramPageId && facebookPageToken) {
                tasks.push(handleInstagramStory(instagram, notion, pageId, properties, instagramPageId, facebookPageToken));
            }

            // Run all tasks concurrently
            const results = await Promise.all(tasks);

            // Check if any task resulted in an error
            hasError = results.some(result => result === true);

            // Update Notion status
            await logger.log(`Attempting to update Automatisation field for page ${pageId}. Has error: ${hasError ? 'Yes' : 'No'}`);
            if (hasError) {
                await notion.updatePublicationSelect(pageId, 'Automatisation', '⛔ Erreur');
            } else {
                await notion.updatePublicationSelect(pageId, 'Automatisation', '✅ Terminé');
            }
        }

        await logger.log('Script ended successfully.');
    } catch (error) {
        await logger.log('Error: ' + error.message);
    } finally {
        await removeLockFile();
    }
}

async function handleFacebookPost(facebook, notion, pageId, properties, facebookPageId, facebookPageToken) {
    const facebookStatus = properties['État Post Facebook']?.select?.name;
    if (facebookStatus !== 'Posté' && facebookStatus !== 'Erreur') {
        const facebookMessage = properties['Facebook']?.rich_text[0]?.plain_text;
        const facebookFiles = properties['Fichiers Facebook'].files;
        const facebookReelCover = properties['Fichier Facebook Reel Cover']?.files[0]?.file?.url;
        
        let result;
        if (facebookFiles.length === 1 && facebook.getMediaType(facebookFiles[0].file.url) === 'VIDEO') {
            result = await facebook.publishReel(facebookPageId, facebookPageToken, facebookMessage, facebookFiles[0].file.url, facebookReelCover);
        } else {
            result = await facebook.publishPost(facebookPageId, facebookPageToken, facebookMessage, facebookFiles, facebookReelCover);
        }

        if (result.error) {
            await notion.updatePublicationStatus(pageId, 'État Post Facebook', 'Erreur');
            await notion.updatePublicationField(pageId, 'facebook_automatisation', result.error);
            return true; // Error occurred
        } else {
            await notion.updatePublicationStatus(pageId, 'État Post Facebook', 'Posté');
            await notion.updatePublicationField(pageId, 'facebook_automatisation', 'Publié avec succès !');
            await notion.updatePublicationField(pageId, 'data_facebook_publication_id', result.id);
            return false; // No error
        }
    }
    return false; // No action taken
}

async function handleInstagramPost(instagram, notion, pageId, properties, instagramPageId, facebookPageToken) {
    const instagramStatus = properties['État Post Instagram']?.select?.name;
    if (instagramStatus !== 'Posté' && instagramStatus !== 'Erreur') {
        const instagramCaption = properties['Instagram']?.rich_text[0]?.plain_text;
        const instagramFiles = properties['Fichiers Instagram'].files;
        const instagramReelCover = properties['Fichier Instagram Reel Cover']?.files[0]?.file?.url;
        
        let result;
        if (instagramFiles.length === 1 && instagram.getMediaType(instagramFiles[0].file.url) === 'VIDEO') {
            result = await instagram.publishReel(instagramPageId, facebookPageToken, instagramCaption, instagramFiles[0].file.url, instagramReelCover);
        } else {
            result = await instagram.publishPost(instagramPageId, facebookPageToken, instagramCaption, instagramFiles, instagramReelCover);
        }

        if (!result || result.error) {
            await notion.updatePublicationStatus(pageId, 'État Post Instagram', 'Erreur');
            await notion.updatePublicationField(pageId, 'instagram_automatisation', 'Une erreur est survenue lors de la publication');
            return true; // Error occurred
        } else {
            await notion.updatePublicationStatus(pageId, 'État Post Instagram', 'Posté');
            await notion.updatePublicationField(pageId, 'data_instagram_publication_id', result.id || result);
            await notion.updatePublicationField(pageId, 'instagram_automatisation', 'Publié avec succès !');
            return false; // No error
        }
    }
    return false; // No action taken
}

async function handleFacebookStory(facebook, notion, pageId, properties, facebookPageId, facebookPageToken) {
    const facebookStoryStatus = properties['État Story Facebook']?.select?.name;
    if (facebookStoryStatus !== 'Posté' && facebookStoryStatus !== 'Erreur') {
        const storyFile = properties['Fichier Story']?.files[0]?.file?.url;
        
        if (storyFile) {
            const facebookStoryResponse = await facebook.publishStory(facebookPageId, facebookPageToken, storyFile);
            if (facebookStoryResponse.id) {
                await notion.updatePublicationStatus(pageId, 'État Story Facebook', 'Posté');
                await notion.updatePublicationField(pageId, 'data_story_facebook_id', facebookStoryResponse.id);
                return false; // No error
            } else {
                const errorMessage = typeof facebookStoryResponse.error === 'object' ? JSON.stringify(facebookStoryResponse.error) : (facebookStoryResponse.error || 'Unknown error');
                await notion.updatePublicationStatus(pageId, 'État Story Facebook', 'Erreur');
                await notion.updatePublicationField(pageId, 'facebook_story_automatisation', errorMessage);
                return true; // Error occurred
            }
        }
    }
    return false; // No action taken
}

async function handleInstagramStory(instagram, notion, pageId, properties, instagramPageId, facebookPageToken) {
    const instagramStoryStatus = properties['État Story Instagram']?.select?.name;
    if (instagramStoryStatus !== 'Posté' && instagramStoryStatus !== 'Erreur') {
        const storyFile = properties['Fichier Story']?.files[0]?.file?.url;
        if (storyFile) {
            const instagramStoryResponse = await instagram.publishStory(instagramPageId, facebookPageToken, storyFile);
            if (instagramStoryResponse.id) {
                await notion.updatePublicationStatus(pageId, 'État Story Instagram', 'Posté');
                await notion.updatePublicationField(pageId, 'data_story_instagram_id', instagramStoryResponse.id);
                return false; // No error
            } else {
                const errorMessage = typeof instagramStoryResponse.error === 'object' ? JSON.stringify(instagramStoryResponse.error) : (instagramStoryResponse.error || 'Unknown error');
                await notion.updatePublicationStatus(pageId, 'État Story Instagram', 'Erreur');
                await notion.updatePublicationField(pageId, 'instagram_story_automatisation', errorMessage);
                return true; // Error occurred
            }
        }
    }
    return false; // No action taken
}

main();
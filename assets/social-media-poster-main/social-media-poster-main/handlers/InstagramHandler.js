const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class InstagramHandler {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }

    async publishPost(pageId, accessToken, caption, mediaFiles = [], reelCoverUrl = null) {
        await this.logger.log(`Starting Instagram post process for page ID: ${pageId}`);
        await this.logger.log(`Number of media files: ${mediaFiles.length}`);
    
        if (mediaFiles.length === 0) {
            await this.logger.log('No media provided for Instagram post');
            return false;
        }
    
        if (mediaFiles.length === 1) {
            const file = mediaFiles[0];
            const mediaType = this.getMediaType(file.name);
            
            if (mediaType === 'VIDEO') {
                return this.publishReel(pageId, accessToken, caption, file.file.url, reelCoverUrl);
            } else {
                return this.publishSinglePhoto(pageId, accessToken, caption, file.file.url);
            }
        } else {
            return this.publishCarousel(pageId, accessToken, caption, mediaFiles);
        }
    }

    async publishReel(pageId, accessToken, caption, videoUrl, coverUrl = null) {
        await this.logger.log("Publishing Reel...");
        const data = {
            video_url: videoUrl,
            media_type: 'REELS',
            caption: caption,
            access_token: accessToken
        };
    
        if (coverUrl) {
            data.cover_url = coverUrl;
        }
    
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/media`;
        const response = await this.postRequest(url, data);
        await this.logger.log(`Create Reel media response: ${JSON.stringify(response)}`);
        
        if (!response.id) {
            await this.logger.log('Failed to create Reel media');
            return false;
        }
    
        const mediaId = response.id;
        
        // Wait for media to be ready
        const readyMediaId = await this.waitForMediaReady(pageId, accessToken, mediaId, 'REELS');
        if (!readyMediaId) {
            await this.logger.log('Reel media failed to become ready');
            return false;
        }
        
        return this.publishMedia(pageId, accessToken, readyMediaId);
    }

    async publishSinglePhoto(pageId, accessToken, caption, photoUrl) {
        await this.logger.log("Publishing single photo...");
        const mediaId = await this.createMedia(pageId, accessToken, photoUrl, 'IMAGE', false, caption);
        if (!mediaId) {
            await this.logger.log('Failed to create photo media');
            return false;
        }
        
        return this.publishMedia(pageId, accessToken, mediaId);
    }
    
    async publishCarousel(pageId, accessToken, caption, mediaFiles) {
        await this.logger.log("Creating carousel...");
        const mediaIds = [];
        for (const file of mediaFiles) {
            const mediaType = this.getMediaType(file.name);
            const mediaId = await this.createMedia(pageId, accessToken, file.file.url, mediaType, true);
            if (mediaId) {
                mediaIds.push(mediaId);
            } else {
                await this.logger.log(`Failed to create media: ${file.name}`);
                return false;
            }
        }
        
        const carouselId = await this.createCarousel(pageId, accessToken, caption, mediaIds);
        if (!carouselId) {
            await this.logger.log('Failed to create carousel');
            return false;
        }
        
        if (!await this.waitForCarouselReady(pageId, accessToken, carouselId)) {
            await this.logger.log('Carousel failed to become ready');
            return false;
        }
        
        return this.publishMedia(pageId, accessToken, carouselId);
    }
    
    async createMedia(pageId, accessToken, mediaUrl, mediaType, isCarouselItem = false, caption = null) {
        await this.logger.log(`Creating media: ${mediaType}`);
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/media`;
        const data = {
            image_url: mediaUrl,
            access_token: accessToken,
            media_type: mediaType,
            is_carousel_item: isCarouselItem ? 'true' : 'false'
        };
        
        // Ajouter la légende lors de la création du conteneur (sauf pour les éléments de carousel)
        if (caption && !isCarouselItem) {
            data.caption = caption;
        }
        
        if (mediaType === 'REELS' || mediaType === 'VIDEO') {
            data.video_url = mediaUrl;
            delete data.image_url;
        }
        
        const response = await this.postRequest(url, data);
        await this.logger.log(`Create media response: ${JSON.stringify(response)}`);
        
        if (!response.id) {
            await this.logger.log("Failed to create media");
            return null;
        }
    
        return this.waitForMediaReady(pageId, accessToken, response.id, mediaType);
    }
    
    async waitForMediaReady(pageId, accessToken, mediaId, mediaType = null, maxAttempts = 30, delay = 10) {
        await this.logger.log(`Waiting for media ${mediaId} to be ready...`);
        const url = `https://graph.facebook.com/${this.config.version}/${mediaId}?fields=status_code&access_token=${accessToken}`;
    
        for (let i = 0; i < maxAttempts; i++) {
            const response = await this.getRequest(url);
            await this.logger.log(`Media status check attempt ${i + 1}: ${JSON.stringify(response)}`);
            
            if (response.status_code) {
                if (response.status_code === 'FINISHED') {
                    await this.logger.log(`Media ${mediaId} is ready`);
                    return mediaId;
                } else if (response.status_code === 'ERROR') {
                    await this.logger.log(`Media ${mediaId} processing failed`);
                    return null;
                }
            }
            
            await this.logger.log(`Media not ready, waiting ${delay} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
    
        await this.logger.log(`Media ${mediaId} not ready after ${maxAttempts} attempts`);
        return null;
    }

    async waitForCarouselReady(pageId, accessToken, carouselId, maxAttempts = 30, delay = 10) {
        await this.logger.log(`Waiting for carousel ${carouselId} to be ready...`);
        const url = `https://graph.facebook.com/${this.config.version}/${carouselId}?fields=status_code&access_token=${accessToken}`;
    
        for (let i = 0; i < maxAttempts; i++) {
            const response = await this.getRequest(url);
            await this.logger.log(`Carousel status check attempt ${i + 1}: ${JSON.stringify(response)}`);
            
            if (response.status_code) {
                if (response.status_code === 'FINISHED') {
                    await this.logger.log(`Carousel ${carouselId} is ready`);
                    return true;
                } else if (response.status_code === 'ERROR') {
                    await this.logger.log(`Carousel ${carouselId} processing failed`);
                    return false;
                }
            }
            
            await this.logger.log(`Carousel not ready, waiting ${delay} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
    
        await this.logger.log(`Carousel ${carouselId} not ready after ${maxAttempts} attempts`);
        return false;
    }

    async createCarousel(pageId, accessToken, caption, mediaIds) {
        await this.logger.log(`Creating carousel with ${mediaIds.length} items`);
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/media`;
        const data = {
            media_type: 'CAROUSEL',
            caption: caption,
            children: mediaIds.join(','),
            access_token: accessToken
        };
        const response = await this.postRequest(url, data);
        await this.logger.log(`Create carousel response: ${JSON.stringify(response)}`);
        return response.id || null;
    }
    
    async publishMedia(pageId, accessToken, mediaId) {
        await this.logger.log(`Publishing media with ID: ${mediaId}`);
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/media_publish`;
        const data = {
            creation_id: mediaId,
            access_token: accessToken
            // caption supprimé car il doit être dans createMedia()
        };
        
        const maxAttempts = 30;
        const delay = 60;
        
        for (let i = 0; i < maxAttempts; i++) {
            const response = await this.postRequest(url, data);
            await this.logger.log(`Publish media attempt ${i + 1} response: ${JSON.stringify(response)}`);
            
            if (response.id) {
                return response.id;
            }
            
            if (response.error && response.error.code == 9007) {
                await this.logger.log(`Media not ready for publishing, waiting ${delay} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay * 1000));
            } else {
                break;
            }
        }
        
        await this.logger.log(`Failed to publish media after ${maxAttempts} attempts`);
        return false;
    }
    
    getMediaType(input) {
        let extension;

        if (input.startsWith('http://') || input.startsWith('https://')) {
            // It's a URL
            try {
                const parsedUrl = new URL(input);
                const path = parsedUrl.pathname;
                const filename = path.split('/').pop();
                extension = filename.split('.').pop().toLowerCase();
            } catch (error) {
                console.error('Invalid URL:', input);
                return 'UNKNOWN';
            }
        } else {
            // It's a direct filename
            extension = input.split('.').pop().toLowerCase();
        }

        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'];

        if (imageExtensions.includes(extension)) {
            return 'IMAGE';
        } else if (videoExtensions.includes(extension)) {
            return 'VIDEO';
        } else {
            return 'UNKNOWN';
        }
    }
    
    async publishStory(pageId, accessToken, mediaUrl) {
        await this.logger.log(`Attempting to publish story for Instagram page ID: ${pageId}`);
        
        if (!pageId || !accessToken || !mediaUrl) {
            await this.logger.log("Invalid parameters for story publication");
            return { error: 'Invalid parameters' };
        }
    
        const mediaType = this.getMediaType(mediaUrl);
        await this.logger.log(`Media type detected: ${mediaType}`);
    
        if (mediaType === 'VIDEO') {
            return this.publishVideoStory(pageId, accessToken, mediaUrl);
        } else {
            return this.publishPhotoStory(pageId, accessToken, mediaUrl);
        }
    }

    async publishPhotoStory(pageId, accessToken, imageUrl) {
        // Step 1: Create the media container for the photo story
        const containerId = await this.createPhotoStoryContainer(pageId, accessToken, imageUrl);
        if (!containerId) {
            await this.logger.log('Failed to create Instagram photo story container');
            return { error: 'Failed to create photo media container' };
        }

        // Step 2: Check the media status
        const mediaStatus = await this.checkMediaStatus(containerId, accessToken);
        if (mediaStatus !== 'FINISHED') {
            await this.logger.log(`Photo processing failed or timed out. Status: ${mediaStatus}`);
            return { error: 'Photo processing failed' };
        }

        // Step 3: Publish the story
        const publishResult = await this.publishStoryMedia(pageId, accessToken, containerId);
        if (publishResult) {
            await this.logger.log(`Instagram photo story published successfully. ID: ${publishResult}`);
            return { id: publishResult };
        } else {
            await this.logger.log("Failed to publish Instagram photo story");
            return { error: 'Failed to publish photo story' };
        }
    }

    async createPhotoStoryContainer(pageId, accessToken, imageUrl) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/media`;
        const data = {
            image_url: imageUrl,
            media_type: 'STORIES',
            access_token: accessToken
        };
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Create photo story container response: ${JSON.stringify(response)}`);
    
        return response.id || null;
    }
    
    async publishVideoStory(pageId, accessToken, videoUrl) {
        // Step 1: Create the media container for the video story
        const containerId = await this.createVideoStoryContainer(pageId, accessToken, videoUrl);
        if (!containerId) {
            await this.logger.log('Failed to create Instagram video story container');
            return { error: 'Failed to create video media container' };
        }
    
        // Step 2: Check the media status
        const mediaStatus = await this.checkMediaStatus(containerId, accessToken);
        if (mediaStatus !== 'FINISHED') {
            await this.logger.log(`Video processing failed or timed out. Status: ${mediaStatus}`);
            return { error: 'Video processing failed' };
        }
    
        // Step 3: Publish the story
        const publishResult = await this.publishStoryMedia(pageId, accessToken, containerId);
        if (publishResult) {
            await this.logger.log(`Instagram video story published successfully. ID: ${publishResult}`);
            return { id: publishResult };
        } else {
            await this.logger.log("Failed to publish Instagram video story");
            return { error: 'Failed to publish video story' };
        }
    }

    async createVideoStoryContainer(pageId, accessToken, videoUrl) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/media`;
        const data = {
            media_type: 'STORIES',
            video_url: videoUrl,
            access_token: accessToken
        };
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Create video story container response: ${JSON.stringify(response)}`);
    
        return response.id || null;
    }
    
    async checkMediaStatus(mediaId, accessToken, maxAttempts = 30, delay = 5) {
        const url = `https://graph.facebook.com/${this.config.version}/${mediaId}?fields=status_code&access_token=${accessToken}`;
    
        for (let i = 0; i < maxAttempts; i++) {
            const response = await this.getRequest(url);
            await this.logger.log(`Media status check attempt ${i + 1}: ${JSON.stringify(response)}`);
    
            if (response.status_code) {
                if (response.status_code === 'FINISHED') {
                    return 'FINISHED';
                } else if (response.status_code === 'ERROR') {
                    return 'ERROR';
                }
            }
    
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
    
        return 'TIMEOUT';
    }

    async initializeVideoUpload(pageId, accessToken) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/video_stories`;
        const data = {
            access_token: accessToken,
            upload_phase: 'start'
        };
    
        return this.postRequest(url, data);
    }

    async uploadVideoContent(uploadUrl, videoUrl, accessToken) {
        try {
            const response = await axios.post(uploadUrl, null, {
                headers: {
                    'Authorization': `OAuth ${accessToken}`,
                    'file_url': videoUrl
                }
            });
            const result = response.data;
            await this.logger.log(`Video content upload response: ${JSON.stringify(result)}`);
            return response.status === 200 && result.success === true;
        } catch (error) {
            await this.logger.log(`Failed to upload video content: ${error.message}`);
            return false;
        }
    }

    async finalizeVideoUpload(pageId, accessToken, videoId) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/video_stories`;
        const data = {
            access_token: accessToken,
            upload_phase: 'finish',
            video_id: videoId
        };
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Finalize video upload response: ${JSON.stringify(response)}`);
    
        return response.id || null;
    }

    async createStoryContainer(pageId, accessToken, mediaUrl, mediaType) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/media`;
        const data = {
            media_type: 'STORIES',
            [mediaType === 'VIDEO' ? 'video_url' : 'image_url']: mediaUrl,
            access_token: accessToken
        };
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Create story container response: ${JSON.stringify(response)}`);
    
        return response.id || null;
    }

    async uploadStoryVideo(containerId, accessToken, videoUrl) {
        const url = `https://graph.facebook.com/${this.config.version}/${containerId}`;
        const data = {
            access_token: accessToken,
            video_url: videoUrl
        };
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Video upload response: ${JSON.stringify(response)}`);
    
        return response.id ? true : false;
    }
    
    async publishStoryMedia(pageId, accessToken, mediaId) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/media_publish`;
        const data = {
            creation_id: mediaId,
            access_token: accessToken
        };

        const response = await this.postRequest(url, data);
        await this.logger.log(`Publish story media response: ${JSON.stringify(response)}`);

        return response.id || null;
    }

    async getRequest(url) {
        try {
            await this.logger.log(`Making GET request to: ${url}`);
            
            const response = await axios.get(url);
            
            await this.logger.log(`Response status: ${response.status}`);
            await this.logger.log(`Response headers: ${JSON.stringify(response.headers, null, 2)}`);
            await this.logger.log(`Response data: ${JSON.stringify(response.data, null, 2)}`);
            
            return response.data;
        } catch (error) {
            await this.logger.log(`GET Request Error: ${error.message}`);
            
            if (error.response) {
                await this.logger.log(`Error response status: ${error.response.status}`);
                await this.logger.log(`Error response headers: ${JSON.stringify(error.response.headers, null, 2)}`);
                await this.logger.log(`Error response data: ${JSON.stringify(error.response.data, null, 2)}`);
                
                return { 
                    error: error.message,
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                };
            } else if (error.request) {
                await this.logger.log(`No response received. Request: ${JSON.stringify(error.request, null, 2)}`);
                return { error: error.message, type: 'no_response' };
            } else {
                await this.logger.log(`Request setup error: ${error.message}`);
                return { error: error.message, type: 'setup_error' };
            }
        }
    }

    async postRequest(url, data) {
        try {
            await this.logger.log(`Making POST request to: ${url}`);
            await this.logger.log(`Request data: ${JSON.stringify(data, null, 2)}`);
            
            const response = await axios.post(url, data);
            
            await this.logger.log(`Response status: ${response.status}`);
            await this.logger.log(`Response headers: ${JSON.stringify(response.headers, null, 2)}`);
            await this.logger.log(`Response data: ${JSON.stringify(response.data, null, 2)}`);
            
            return response.data;
        } catch (error) {
            await this.logger.log(`POST Request Error: ${error.message}`);
            
            if (error.response) {
                await this.logger.log(`Error response status: ${error.response.status}`);
                await this.logger.log(`Error response headers: ${JSON.stringify(error.response.headers, null, 2)}`);
                await this.logger.log(`Error response data: ${JSON.stringify(error.response.data, null, 2)}`);
                
                return { 
                    error: error.message,
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                };
            } else if (error.request) {
                await this.logger.log(`No response received. Request: ${JSON.stringify(error.request, null, 2)}`);
                return { error: error.message, type: 'no_response' };
            } else {
                await this.logger.log(`Request setup error: ${error.message}`);
                return { error: error.message, type: 'setup_error' };
            }
        }
    }
}

module.exports = InstagramHandler;
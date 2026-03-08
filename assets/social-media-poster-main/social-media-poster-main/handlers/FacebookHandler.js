const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class FacebookHandler {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }

    async publishPost(pageId, accessToken, message, mediaFiles = [], reelCoverUrl = null) {
        await this.logger.log(`Starting Facebook post process for page ID: ${pageId}`);
        await this.logger.log(`Number of media files: ${mediaFiles.length}`);
    
        if (mediaFiles.length === 0) {
            return this.publishMessage(pageId, accessToken, message);
        }
        
        const validationError = this.validateMediaFiles(mediaFiles);
        console.log(validationError);
        if (validationError) {
            return { error: validationError };
        }
    
        if (mediaFiles.length === 1) {
            const file = mediaFiles[0];
            const mediaType = this.getMediaType(file.name);
            
            if (mediaType === 'VIDEO') {
                return this.publishReel(pageId, accessToken, message, file.file.url, reelCoverUrl);
            } else {
                return this.publishPhoto(pageId, accessToken, message, file.file.url);
            }
        } else {
            return this.publishCarousel(pageId, accessToken, message, mediaFiles);
        }
    }
    
    getReelCoverImageUrl(mediaFiles) {
        for (const file of mediaFiles) {
            if (file.name === 'Fichier Facebook Reel Cover') {
                return file.file.url;
            }
        }
        return null;
    }

    async uploadVideo(pageId, accessToken, videoUrl) {
        await this.logger.log(`Starting video upload for page ID: ${pageId}`);
        await this.logger.log(`Video URL: ${videoUrl}`);
        
        const initUrl = `https://graph.facebook.com/${this.config.version}/${pageId}/video_stories`;
        const initData = {
            upload_phase: 'start',
            access_token: accessToken
        };
        
        await this.logger.log(`Initializing video upload with data: ${JSON.stringify(initData, null, 2)}`);
        const initResponse = await this.postRequest(initUrl, initData);
        
        if (initResponse.error) {
            await this.logger.log(`Failed to initialize video upload due to API error: ${JSON.stringify(initResponse)}`);
            return null;
        }
        
        if (!initResponse.video_id || !initResponse.upload_url) {
            await this.logger.log(`Failed to initialize video upload: Missing video_id or upload_url in response: ${JSON.stringify(initResponse)}`);
            return null;
        }
        
        const videoId = initResponse.video_id;
        const uploadUrl = initResponse.upload_url;
        
        await this.logger.log(`Video ID received: ${videoId}`);
        await this.logger.log(`Upload URL received: ${uploadUrl}`);
        
        try {
            await this.logger.log(`Starting video file upload to: ${uploadUrl}`);
            await this.logger.log(`Upload headers: Authorization: OAuth ${accessToken.substring(0, 10)}..., file_url: ${videoUrl}`);
            
            const response = await axios.post(uploadUrl, null, {
                headers: {
                    'Authorization': `OAuth ${accessToken}`,
                    'file_url': videoUrl
                }
            });
            
            await this.logger.log(`Upload response status: ${response.status}`);
            await this.logger.log(`Upload response headers: ${JSON.stringify(response.headers, null, 2)}`);
            await this.logger.log(`Upload response data: ${JSON.stringify(response.data, null, 2)}`);
            
            const uploadResult = response.data;
            if (!uploadResult.success) {
                await this.logger.log(`Video upload failed: ${JSON.stringify(uploadResult)}`);
                return null;
            }
            
            await this.logger.log(`Video upload successful for video ID: ${videoId}`);
            return videoId;
        } catch (error) {
            await this.logger.log(`Video upload error: ${error.message}`);
            
            if (error.response) {
                await this.logger.log(`Upload error response status: ${error.response.status}`);
                await this.logger.log(`Upload error response headers: ${JSON.stringify(error.response.headers, null, 2)}`);
                await this.logger.log(`Upload error response data: ${JSON.stringify(error.response.data, null, 2)}`);
            } else if (error.request) {
                await this.logger.log(`No response received during upload. Request: ${JSON.stringify(error.request, null, 2)}`);
            } else {
                await this.logger.log(`Upload request setup error: ${error.message}`);
            }
            
            return null;
        }
    }
    
    async publishReel(pageId, accessToken, caption, videoUrl, coverUrl = null) {
        await this.logger.log("Publishing Facebook Reel...");
        
        const initUrl = `https://graph.facebook.com/${this.config.version}/${pageId}/video_reels`;
        const initData = {
            upload_phase: 'start',
            access_token: accessToken
        };
        const initResponse = await this.postRequest(initUrl, initData);
        
        if (!initResponse.video_id || !initResponse.upload_url) {
            await this.logger.log(`Failed to initialize Reel upload: ${JSON.stringify(initResponse)}`);
            return { error: "Failed to initialize Reel upload." };
        }
        
        const videoId = initResponse.video_id;
        const uploadUrl = initResponse.upload_url;
        
        const uploadSuccess = await this.uploadReelVideo(uploadUrl, videoUrl, accessToken);
        if (!uploadSuccess) {
            await this.logger.log("Failed to upload Reel video");
            return { error: "Failed to upload Reel video." };
        }
        
        const publishUrl = `https://graph.facebook.com/${this.config.version}/${pageId}/video_reels`;
        const publishData = {
            video_id: videoId,
            upload_phase: 'finish',
            video_state: 'PUBLISHED',
            description: caption,
            access_token: accessToken
        };
        
        const response = await this.postRequest(publishUrl, publishData);
        await this.logger.log(`Publish Reel response: ${JSON.stringify(response)}`);
        
        if (response.success === true) {
            if (coverUrl) {
                await this.uploadReelCover(videoId, accessToken, coverUrl);
            }
            return { id: videoId, success: true };
        } else {
            return { error: "Failed to publish Reel." };
        }
    }
    
    async uploadReelVideo(uploadUrl, videoUrl, accessToken) {
        try {
            const response = await axios.post(uploadUrl, null, {
                headers: {
                    'Authorization': `OAuth ${accessToken}`,
                    'file_url': videoUrl
                }
            });
            
            const uploadResult = response.data;
            await this.logger.log(`Upload Reel video response: ${JSON.stringify(uploadResult)}`);
            
            return response.status === 200 && uploadResult.success === true;
        } catch (error) {
            await this.logger.log(`Failed to upload Reel video: ${error.message}`);
            return false;
        }
    }
    
    async checkReelStatus(videoId, accessToken, maxAttempts = 30, delay = 10) {
        const url = `https://graph.facebook.com/${this.config.version}/${videoId}?fields=status&access_token=${accessToken}`;
        
        for (let i = 0; i < maxAttempts; i++) {
            const response = await this.getRequest(url);
            await this.logger.log(`Reel status check attempt ${i + 1}: ${JSON.stringify(response)}`);
            
            if (response.status && response.status.video_status) {
                if (response.status.video_status === 'ready') {
                    await this.logger.log(`Reel ${videoId} is ready`);
                    return 'ready';
                } else if (response.status.video_status === 'error') {
                    await this.logger.log(`Reel ${videoId} processing failed`);
                    return 'error';
                }
            }
            
            await this.logger.log(`Reel not ready, waiting ${delay} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
        
        await this.logger.log(`Reel ${videoId} not ready after ${maxAttempts} attempts`);
        return 'timeout';
    }
    
    async uploadReelCover(videoId, accessToken, coverUrl) {
        const url = `https://graph.facebook.com/${this.config.version}/${videoId}/thumbnails`;
        
        const tempFile = path.join(require('os').tmpdir(), 'fb_cover_' + Date.now() + '.jpg');
        const writer = fs.createWriteStream(tempFile);
        
        const response = await axios({
            url: coverUrl,
            method: 'GET',
            responseType: 'stream'
        });
        
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        
        const form = new FormData();
        form.append('access_token', accessToken);
        form.append('is_preferred', 'true');
        form.append('source', fs.createReadStream(tempFile));
        
        try {
            const uploadResponse = await axios.post(url, form, {
                headers: form.getHeaders()
            });
            
            await this.logger.log(`Upload Reel cover response: ${JSON.stringify(uploadResponse.data)}`);
            
            fs.unlinkSync(tempFile);
            
            return uploadResponse.data && uploadResponse.data.id;
        } catch (error) {
            await this.logger.log(`Failed to upload Reel cover: ${error.message}`);
            fs.unlinkSync(tempFile);
            return false;
        }
    }
    
    async publishVideo(pageId, accessToken, description, videoId) {
        const url = `https://graph-video.facebook.com/${this.config.version}/${pageId}/videos`;
        const data = {
            description: description,
            access_token: accessToken,
            fbuploader_video_file_chunk: videoId
        };
        
        const response = await this.postRequest(url, data);
        await this.logger.log(`Publish Video response: ${JSON.stringify(response)}`);
        
        if (response.id) {
            return { id: response.id };
        } else {
            return { error: "Failed to publish Video." };
        }
    }
    
    async createPost(pageId, accessToken, message, attachments) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/feed`;
        const data = {
            message: message,
            access_token: accessToken,
            attached_media: JSON.stringify(attachments)
        };
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Post creation response: ${JSON.stringify(response)}`);
    
        if (response.id) {
            await this.logger.log(`Post published successfully. ID: ${response.id}`);
            return response;
        } else {
            await this.logger.log("Failed to publish post.");
            return { error: "Failed to publish post." };
        }
    }

    validateMediaFiles(mediaFiles) {
        let videoCount = 0;
        let imageCount = 0;
        
        for (const file of mediaFiles) {
            
            const mediaType = this.getMediaType(file.name);
            if (mediaType === 'VIDEO') {
                videoCount++;
            } else {
                imageCount++;
            }
        }
      
        if (videoCount > 1) {
            return "Multiple videos are not allowed in a single post.";
        }
    
        if (videoCount == 1 && imageCount > 0) {
            return "Mixing videos and images is not allowed in a single post.";
        }
    
        return null; // Validation passed
    }
    
    async uploadMediaWithRetry(pageId, accessToken, mediaUrl, mediaType, maxRetries) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const mediaId = await this.uploadMedia(pageId, accessToken, mediaUrl, mediaType);
            if (mediaId) {
                return mediaId;
            }
            await this.logger.log(`Upload attempt ${attempt} failed. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
        }
        return null;
    }
    
    async uploadMedia(pageId, accessToken, mediaUrl, mediaType) {
        await this.logger.log(`Uploading media for story: ${mediaType}`);
        const url = mediaType === 'VIDEO' 
            ? `https://graph-video.facebook.com/${this.config.version}/${pageId}/videos`
            : `https://graph.facebook.com/${this.config.version}/${pageId}/photos`;
    
        const data = {
            access_token: accessToken,
            published: 'false',
            [mediaType === 'VIDEO' ? 'file_url' : 'url']: mediaUrl
        };
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Media upload response: ${JSON.stringify(response)}`);
    
        return response.id || null;
    }

    async createAndPublishCarousel(pageId, accessToken, message, attachments) {
        await this.logger.log(`Creating carousel with ${attachments.length} images`);
        const carouselId = await this.createCarouselContainer(pageId, accessToken, message, attachments);
        if (carouselId) {
            if (await this.waitForCarouselReady(pageId, accessToken, carouselId)) {
                return this.publishCarousel(pageId, accessToken, carouselId);
            } else {
                await this.logger.log("Carousel failed to become ready");
                return { error: "Carousel failed to become ready." };
            }
        }
        await this.logger.log("Failed to create carousel container");
        return { error: "Failed to create carousel." };
    }

    async createCarouselContainer(pageId, accessToken, message, attachments) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/feed`;
        const data = {
            message: message,
            access_token: accessToken,
            published: 'false',
            children: attachments.join(',')
        };
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Carousel creation response: ${JSON.stringify(response)}`);
    
        return response.id || null;
    }
    

    async publishCarousel(pageId, accessToken, message, mediaFiles) {
        const attachments = [];
        for (const file of mediaFiles) {
            const mediaType = this.getMediaType(file.name);
            const mediaId = await this.uploadMedia(pageId, accessToken, file.file.url, mediaType);
            if (mediaId) {
                attachments.push({ media_fbid: mediaId });
            } else {
                await this.logger.log(`Failed to upload media: ${file.name}`);
            }
        }
        
        if (attachments.length === 0) {
            return { error: "Failed to upload any media for carousel." };
        }
        
        return this.createPost(pageId, accessToken, message, attachments);
    }
    
    async waitForCarouselReady(pageId, accessToken, carouselId, maxAttempts = 30, delay = 5) {
        await this.logger.log(`Waiting for carousel ${carouselId} to be ready...`);
        const url = `https://graph.facebook.com/${this.config.version}/${carouselId}?fields=id,message&access_token=${accessToken}`;
    
        for (let i = 0; i < maxAttempts; i++) {
            const response = await this.getRequest(url);
            await this.logger.log(`Carousel status check attempt ${i + 1}: ${JSON.stringify(response)}`);
    
            if (response.id && response.message) {
                await this.logger.log(`Carousel ${carouselId} is ready`);
                return true;
            }
    
            await this.logger.log(`Carousel not ready, waiting ${delay} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
    
        await this.logger.log(`Carousel ${carouselId} not ready after ${maxAttempts} attempts`);
        return false;
    }

    async publishSinglePostWithRetry(pageId, accessToken, message, attachments, maxRetries) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const url = `https://graph.facebook.com/${this.config.version}/${pageId}/feed`;
            const data = {
                message: message,
                access_token: accessToken,
                attached_media: JSON.stringify(attachments.map(mediaId => ({ media_fbid: mediaId })))
            };

            const response = await this.postRequest(url, data);
            await this.logger.log(`Facebook post response: ${JSON.stringify(response)}`);

            if (response.id) {
                await this.logger.log(`Post published successfully. ID: ${response.id}`);
                return response;
            }

            await this.logger.log(`Publish attempt ${attempt} failed. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        await this.logger.log(`Failed to publish post after ${maxRetries} attempts.`);
        return { error: `Failed to publish post after ${maxRetries} attempts.` };
    }

    async waitForMediaReady(pageId, accessToken, mediaId, mediaType, maxAttempts = 30, delay = 10) {
        await this.logger.log(`Waiting for media ${mediaId} to be ready...`);
        
        if (mediaType !== 'VIDEO') {
            await this.logger.log(`Non-video media ${mediaId} is assumed to be ready immediately`);
            return mediaId;
        }
        
        const url = `https://graph.facebook.com/${this.config.version}/${mediaId}?fields=status&access_token=${accessToken}`;

        for (let i = 0; i < maxAttempts; i++) {
            const response = await this.getRequest(url);
            await this.logger.log(`Media status check attempt ${i + 1}: ${JSON.stringify(response)}`);

            if (response.status && response.status.video_status) {
                if (response.status.video_status === 'ready') {
                    await this.logger.log(`Video ${mediaId} is ready`);
                    return mediaId;
                } else if (response.status.video_status === 'error') {
                    await this.logger.log(`Video ${mediaId} processing failed`);
                    return null;
                }
            }

            await this.logger.log(`Video not ready, waiting ${delay} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }

        await this.logger.log(`Video ${mediaId} not ready after ${maxAttempts} attempts`);
        return null;
    }

    async publishPhoto(pageId, accessToken, message, photoUrl) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/photos`;
        const data = {
            url: photoUrl,
            message: message,
            access_token: accessToken
        };
        
        const response = await this.postRequest(url, data);
        await this.logger.log(`Publish Photo response: ${JSON.stringify(response)}`);
        
        if (response.id) {
            return { id: response.id };
        } else {
            return { error: "Failed to publish Photo." };
        }
    }
    
    async publishStory(pageId, accessToken, mediaUrl) {
        await this.logger.log(`Attempting to publish story for page ID: ${pageId}`);
        
        if (!pageId || !accessToken || !mediaUrl) {
            await this.logger.log("Invalid parameters for story publication");
            return { error: 'Invalid parameters' };
        }
    
        const mediaType = this.getMediaType(mediaUrl);
        await this.logger.log(`Media type detected: ${mediaType}`);
    
        if (mediaType === 'IMAGE') {
            return this.publishPhotoStory(pageId, accessToken, mediaUrl);
        } else {
            return this.publishVideoStory(pageId, accessToken, mediaUrl);
        }
    }

    async publishPhotoStory(pageId, accessToken, photoUrl) {
        // Step 1: Upload the photo
        const photoId = await this.uploadMediaWithRetry(pageId, accessToken, photoUrl, 'IMAGE', 3);
        if (!photoId) {
            await this.logger.log("Failed to upload photo for story.");
            return { error: "Failed to upload photo for story." };
        }

        // Step 2: Publish the story with the photo
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/photo_stories`;
        const data = {
            photo_id: photoId,
            access_token: accessToken
        };

        const response = await this.postRequest(url, data);
        await this.logger.log(`Publish photo story response: ${JSON.stringify(response)}`);
        
        if (response.success === true && response.post_id) {
            await this.logger.log(`Photo story successfully published with post_id: ${response.post_id}`);
            return { id: response.post_id };
        } else {
            await this.logger.log(`Failed to publish photo story. Response: ${JSON.stringify(response)}`);
            return { error: "Failed to publish photo story." };
        }
    }
    
    async uploadPhoto(pageId, accessToken, photoUrl) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/photos`;
        const data = {
            url: photoUrl,
            published: 'false',
            access_token: accessToken
        };
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Upload photo response: ${JSON.stringify(response)}`);
    
        return response.id || null;
    }

    async downloadFile(url) {
        const tempFile = path.join(require('os').tmpdir(), 'fb_story_' + Date.now());
        const writer = fs.createWriteStream(tempFile);
        
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(tempFile));
            writer.on('error', reject);
        });
    }

    async finalizeStoryPublish(pageId, accessToken, mediaId, mediaType) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/${mediaType === 'VIDEO' ? 'video_stories' : 'photo_stories'}`;
        const data = {
            access_token: accessToken,
            [mediaType === 'VIDEO' ? 'video_id' : 'upload_id']: mediaId,
        };
    
        if (mediaType === 'VIDEO') {
            data.upload_phase = 'finish';
        }
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Publish story response: ${JSON.stringify(response)}`);
        return response;
    }
    
    async initializeUploadSession(pageId, accessToken, mediaType) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/${mediaType === 'VIDEO' ? 'video_stories' : 'photo_stories'}`;
        const data = {
            access_token: accessToken,
            upload_phase: 'start'
        };
    
        await this.logger.log(`Initializing upload session. URL: ${url}`);
        await this.logger.log(`Request data: ${JSON.stringify(data)}`);
    
        const response = await this.postRequest(url, data);
        await this.logger.log(`Initialize upload session response: ${JSON.stringify(response)}`);
        return response;
    }
    
    async uploadStoryMedia(uploadUrl, mediaUrl, mediaType) {
        try {
            const response = await axios.post(uploadUrl, null, {
                headers: {
                    'Authorization': `OAuth ${this.config.access_token}`,
                    'file_url': mediaUrl
                }
            });
    
            const result = response.data;
            await this.logger.log(`Story media upload response: ${JSON.stringify(result)}`);
            return result;
        } catch (error) {
            await this.logger.log(`Error uploading story media: ${error.message}`);
            return null;
        }
    }
    
    async checkStoryStatus(accessToken, mediaId, mediaType, maxAttempts = 30, delay = 10) {
        const url = `https://graph.facebook.com/${this.config.version}/${mediaId}?fields=status&access_token=${accessToken}`;
    
        for (let i = 0; i < maxAttempts; i++) {
            const response = await this.getRequest(url);
            await this.logger.log(`Story status check attempt ${i + 1}: ${JSON.stringify(response)}`);
    
            if (mediaType === 'VIDEO') {
                if (response.status && response.status.video_status) {
                    const status = response.status.video_status;
                    if (status === 'ready') {
                        await this.logger.log(`Video story ${mediaId} is ready`);
                        return 'ready';
                    } else if (status === 'error') {
                        await this.logger.log(`Video story ${mediaId} processing failed`);
                        return 'error';
                    }
                }
            } else { // IMAGE
                if (response.status_type === 'approved') {
                    await this.logger.log(`Photo story ${mediaId} is ready`);
                    return 'ready';
                }
            }
    
            await this.logger.log(`Story not ready, waiting ${delay} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
    
        await this.logger.log(`Story ${mediaId} not ready after ${maxAttempts} attempts`);
        return 'timeout';
    }
    
    async publishVideoStory(pageId, accessToken, videoUrl) {
        await this.logger.log(`Starting video story publication for page ID: ${pageId}`);
        await this.logger.log(`Video URL for story: ${videoUrl}`);
        
        const videoId = await this.uploadVideo(pageId, accessToken, videoUrl);
        if (!videoId) {
            await this.logger.log(`Video story publication failed: Could not upload video`);
            return { error: "Failed to upload video for story." };
        }
    
        await this.logger.log(`Video uploaded successfully, proceeding to publish story with video ID: ${videoId}`);
        
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/video_stories`;
        const data = {
            video_id: videoId,
            access_token: accessToken,
            upload_phase: 'finish'
        };
    
        await this.logger.log(`Publishing video story with data: ${JSON.stringify(data, null, 2)}`);
        const response = await this.postRequest(url, data);
        
        if (response.error) {
            await this.logger.log(`Video story publication failed with API error: ${JSON.stringify(response)}`);
            return { 
                error: "Failed to publish video story.", 
                details: response 
            };
        }
    
        if (response.success === true && response.post_id) {
            await this.logger.log(`Video story published successfully with post_id: ${response.post_id}`);
            await this.logger.log(`Checking story status for video ID: ${videoId}`);
            
            const status = await this.checkStoryStatus(accessToken, videoId, 'VIDEO');
            await this.logger.log(`Story status check result: ${status}`);
            
            if (status === 'ready') {
                await this.logger.log(`Video story is ready and published successfully`);
                return { id: response.post_id };
            } else {
                await this.logger.log(`Video story published but status is not ready: ${status}`);
                return { error: `Story published but not ready. Status: ${status}` };
            }
        } else {
            await this.logger.log(`Video story publication failed: Unexpected response format: ${JSON.stringify(response)}`);
            return { 
                error: "Failed to publish video story.", 
                details: response 
            };
        }
    }
    
    getMediaType(input) {
        let extension;
    
        if (input.startsWith('http://') || input.startsWith('https://')) {
            // C'est une URL
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
            // C'est un nom de fichier direct
            extension = input.split('.').pop().toLowerCase();
        }
    
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'];
    
        if (imageExtensions.includes(extension)) {
            return 'IMAGE';
        } else if (videoExtensions.includes(extension)) {
            return 'VIDEO';
        } else {
            // Si on ne peut pas déterminer le type, on retourne 'UNKNOWN'
            return 'UNKNOWN';
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
            await this.logger.log(`CURL Error: ${error.message}`);
            
            if (error.response) {
                // La requête a été faite et le serveur a répondu avec un code d'erreur
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
                // La requête a été faite mais aucune réponse n'a été reçue
                await this.logger.log(`No response received. Request: ${JSON.stringify(error.request, null, 2)}`);
                return { error: error.message, type: 'no_response' };
            } else {
                // Quelque chose s'est passé lors de la configuration de la requête
                await this.logger.log(`Request setup error: ${error.message}`);
                return { error: error.message, type: 'setup_error' };
            }
        }
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
            await this.logger.log(`CURL Error: ${error.message}`);
            
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

    async publishMessage(pageId, accessToken, message) {
        const url = `https://graph.facebook.com/${this.config.version}/${pageId}/feed`;
        const data = {
            message: message,
            access_token: accessToken
        };

        const response = await this.postRequest(url, data);
        await this.logger.log(`Facebook message post response: ${JSON.stringify(response)}`);

        if (response.id) {
            await this.logger.log(`Message published successfully. ID: ${response.id}`);
            return response;
        } else {
            await this.logger.log("Failed to publish message.");
            return { error: "Failed to publish message." };
        }
    }
}

module.exports = FacebookHandler;
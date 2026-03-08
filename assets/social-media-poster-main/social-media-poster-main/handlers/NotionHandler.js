const axios = require('axios');

class NotionHandler {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }

    async getPublicationsToPost() {
        const queryData = {
            filter: {
                and: [
                    {
                        property: 'Automatisation',
                        select: { equals: '🔄 Poster' }
                    },
                    {
                        property: 'data_timestamp',
                        formula: { number: { less_than: Date.now() / 1000 } }
                    }
                ]
            },
            sorts: [
                { property: 'data_timestamp', direction: 'ascending' }
            ]
        };

        try {
            const response = await this.postRequest(
                `https://api.notion.com/v1/databases/${this.config.database_id}/query`,
                queryData
            );

            if (response.results) {
                await this.logger.log('Notion API response received.');
                return response.results;
            } else {
                await this.logger.log('No results from Notion API.');
                return [];
            }
        } catch (error) {
            await this.logger.log(`Error fetching publications: ${error.message}`);
            return [];
        }
    }

    async updatePublicationStatus(pageId, statusField, status) {
        const updateData = {
            properties: {
                [statusField]: {
                    select: {
                        name: status
                    }
                }
            }
        };

        await this.patchRequest(`https://api.notion.com/v1/pages/${pageId}`, updateData);
    }

    async updatePublicationField(pageId, field, value) {
        const updateData = {
            properties: {
                [field]: {
                    rich_text: [
                        {
                            text: {
                                content: value
                            }
                        }
                    ]
                }
            }
        };

        await this.patchRequest(`https://api.notion.com/v1/pages/${pageId}`, updateData);
    }

    async updatePublicationSelect(pageId, fieldName, value) {
        await this.logger.log(`Updating Select field ${fieldName} for page ${pageId} with value: ${value}`);
        
        try {
            const updateData = {
                properties: {
                    [fieldName]: {
                        select: {
                            name: value
                        }
                    }
                }
            };
    
            const response = await this.patchRequest(`https://api.notion.com/v1/pages/${pageId}`, updateData);
            
            if (response.id) {
                await this.logger.log(`Successfully updated ${fieldName} for page ${pageId}`);
                return true;
            } else {
                await this.logger.log(`Failed to update ${fieldName} for page ${pageId}`);
                return false;
            }
        } catch (error) {
            await this.logger.log(`Error updating ${fieldName}: ${error.message}`);
            return false;
        }
    }

    async postRequest(url, data) {
        return this.request(url, data, 'POST');
    }

    async patchRequest(url, data) {
        const response = await this.request(url, data, 'PATCH');
        if (response.error) {
            await this.logger.log(`Notion API Error: ${JSON.stringify(response.error)}`);
            return false;
        }
        return response;
    }

    async request(url, data, method) {
        try {
            const response = await axios({
                method: method,
                url: url,
                data: data,
                headers: {
                    'Authorization': `Bearer ${this.config.token}`,
                    'Notion-Version': this.config.version,
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        } catch (error) {
            await this.logger.log(`Notion API Request Error: ${error.message}`);
            return { error: error.message };
        }
    }
}

module.exports = NotionHandler;
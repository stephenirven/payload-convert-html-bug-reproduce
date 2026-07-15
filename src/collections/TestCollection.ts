import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import type { CollectionConfig } from 'payload'

export const TestCollection: CollectionConfig = {
  slug: 'testCollection',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'richtext',
      type: 'richText',
      required: true,
    },
  ],
  endpoints: [
    {
      path: '/create-new-fail',
      method: 'get',
      handler: async (req) => {
        try {
          // Get the media object with ID 1.
          const media = await req.payload.findByID({ id: 1, collection: 'media' })

          if (!media) {
            throw new Error('Please upload an image to media collection with ID: 1 to proceed')
          }

          // get the ID and URL of the media object
          const id = media.id
          const url = media.url

          // construct an HTML snippet for an image referencing the upload
          const htmlBody = `<img src="${url}" data-lexical-upload-id="${id}" data-lexical-upload-relation-to="media" alt="alt text">`

          req.payload.logger.info(`HTML source:`)
          req.payload.logger.info(htmlBody)

          // Convert the HTML snippet to lexical object form.
          const config = req.payload.config
          const lexicalJSON = convertHTMLToLexical({
            editorConfig: await editorConfigFactory.default({
              config,
            }),
            html: htmlBody || '',
            JSDOM,
          })

          req.payload.logger.info(`lexical output:`)
          req.payload.logger.info(lexicalJSON)

          /*
           * Object looks something like this: 

            root: {
              "children": [
                {
                  "type": "upload",
                  "version": 3,
                  "format": "",
                  "fields": {},
                  "relationTo": "media",
                  "value": "1",          <------------ THIS VALUE SHOULD BE 1, NOT "1"
                  "id": "6a57b1fbbfbe0d03bca26c84"
                }
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "root",
              "version": 1
            }
          */

          // Attempt to create the collection item with the lexical content field.
          // THIS WILL FAIL due to incorrect ID "1"
          await req.payload.create({
            collection: 'testCollection',
            data: {
              richtext: lexicalJSON,
            },
          })

          // Yeah, we won't get here if the bug is present.
          return Response.json({
            success: true,
            message:
              'Test Failed successfully... Bug was not reproduced... Check the record has been created',
          })
        } catch (error) {
          console.dir(error, { depth: 10 })
          return Response.json({ success: false, message: error }, { status: 500 }) // RETURN error to client
        }
      },
    },
  ],
}

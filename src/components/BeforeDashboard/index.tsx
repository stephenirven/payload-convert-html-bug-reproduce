import { Banner } from '@payloadcms/ui/elements/Banner'
import type React from 'react'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>HTML to Lexical conversion bug reproduction. </h4>
      </Banner>
      <h2>How to reproduce the bug</h2>
      <ul className={`${baseClass}__instructions`}>
        <li>Upload an image to the media collection, so that it has id: 1.</li>
        <li>
          Visit{' '}
          <a
            href="http://localhost:3000/api/testCollection/create-new-fail"
            target="_blank"
            rel="noopener"
          >
            this endpoint
          </a>{' '}
          to try to programmatically create a new TestCollection item with a richtext field from an
          HTML fragment referencing your previous upload.
        </li>
        <li>
          View the payload logs to see the HTML fragment, the resulting lexical object, and the
          error details.
        </li>
        <li>The code for the reproduction is in the /src/collections/TestCollection.ts</li>
      </ul>
      <h2>Explanation</h2>
      <div>
        When converting HTML to lexical using the approach detailed{' '}
        <a
          target="_BLANK"
          href="https://payloadcms.com/docs/rich-text/converting-html#approach-1-pre-upload-images-and-use-data-attributes-recommended"
        >
          here in the documentation
        </a>{' '}
        and replacing the image tags with versions referencing the upload, using the
        data-lexical-upload-id and data-lexical-upload-relation-to attributes, the values must be
        quoted strings. The convertHTMLToLexical converts the value to a quoted string value of "1"
        (or whatever the ID is). This appears to be used as a literal value "1" for the upload
        lookup, which fails due to the id field being an integer, producing the error "upload node
        failed to validate: This field is not a valid upload ID."
      </div>
      <h2>Suggested fix</h2>
      <div>
        A possible fix for this would be to determine if the ID field for the referenced upload
        collection is an integer or string (or other type I guess), and convert the passed ID
        accordingly - possibly inside the convertHTMLToLexical function. I think the node conversion
        is performed upstream in the lexical package, and the behaviour is arguably logical there,
        as their code probably doesn't have a way to determine the type of the passed value.
      </div>
      <h2>Workaround</h2>
      <div>
        As a workaround, it's possible to recursively run through the converted lexical output and
        change the values of upload from "x" to x.
      </div>
      <div>
        Note - This bug manifests in database configs using an integer ID type. Presumably this
        works normally for any setup using strings / guids for keys.
      </div>
    </div>
  )
}

export default BeforeDashboard

import React, { useState } from 'react';
import { Page } from 'react-pdf';
import { Document } from 'react-pdf/dist/esm/entry.webpack';

export default function RenderPdf() {
  const [numPages, setNumPages] = useState(null);
  // const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const getPages = () => {
    let content = [];
    for (let i = 1; i <= numPages; i++) {
      content.push(
        <div key={i}>
          <Page pageNumber={i} />
          <p>Page {i} of {numPages}</p>
        </div>
      );
    }
    return content;
  };

  return (
    <div>
      <Document
        file={process.env.PUBLIC_URL + '/1.pdf'}
        loading={<img src={process.env.PUBLIC_URL + '/loading.gif'} />}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {getPages()}
      </Document>
    </div>
  );
}
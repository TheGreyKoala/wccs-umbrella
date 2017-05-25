"use strict;"
const functions = [];
functions.push((document, createAnnotation) => createAnnotation(document, "#content h3", "PageHeading"));
functions.push((document, createAnnotation) => createAnnotation(document, "h4.panel-title", "FaqSectionTitle"));
functions.push((document, createAnnotation) => createAnnotation(document, "h6.hrf-title", "Question"));
functions.push((document, createAnnotation) => createAnnotation(document, "div.hrf-content", "Answer"));
exports.getFunctions = () => functions;

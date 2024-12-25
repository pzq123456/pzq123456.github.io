onmessage = (event) => {
    importScripts('/example/highlight.min.js');
    const result = self.hljs.highlightAuto(event.data);
    postMessage(result.value);
  };
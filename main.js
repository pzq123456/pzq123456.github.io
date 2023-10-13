// axios.get('/README.md')
// .then(function (response) {
//   // handle success
//   document.getElementById('content').innerHTML =
//     marked.parse(response.data);
// })
// .catch(function (error) {
//   // handle error
//   console.log(error);
// });
import { fileToHtml } from './helpers/markdown.js';


// createNavBar();
// find the element with id='content'

fileToHtml('/README.md',document.getElementById('content'),{
    'padding': '10px',
    'font-family': 'monospace',
    'font-size': '14px',
    'overflow': 'auto',
    'border': '1px solid #ddd',
    'background-color': '#f6f8fa',
})


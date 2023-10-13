import { fileToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';

fileToHtml('/README.md',document.getElementById('content'),{
    'padding': '10px',
    'font-family': 'monospace',
    'font-size': '14px',
    'overflow': 'auto',
    'border': '1px solid #8b949e',
    'border-radius': '5px',
    'background-color': '#0d1117',
    'width': '80%',
})

fillNavBar(document.getElementById('navBar'),[
    {
        "text": "Home",
        "action": function(){
            window.location.href = '/pages/p1.html';
        }
    }
],
{
    'display': 'flex',
    'flex-direction': 'column',
    'justify-content': 'center',
    'align-items': 'center',
    'width': '10%',
}
);

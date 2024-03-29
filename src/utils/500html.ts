export default `<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 99999;
                --monospace: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                --red: #ff5555;
                --yellow: #e2aa53;
                --purple: #cfa4ff;
                --cyan: #2dd9da;
                --dim: #c9c9c9;

                --window-background: #181818;
                --window-color: #d8d8d8;
            }

            .backdrop {
                position: fixed;
                z-index: 99999;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow-y: scroll;
                margin: 0;
                background: rgba(0, 0, 0, 0.66);
            }

            .window {
                font-family: var(--monospace);
                line-height: 1.5;
                width: 800px;
                color: var(--window-color);
                margin: 30px auto;
                padding: 25px 40px;
                position: relative;
                background: var(--window-background);
                border-radius: 6px 6px 8px 8px;
                box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
                overflow: hidden;
                border-top: 8px solid var(--red);
                direction: ltr;
                text-align: left;
            }

            pre {
                font-family: var(--monospace);
                font-size: 16px;
                margin-top: 0;
                margin-bottom: 1em;
                overflow-x: scroll;
                scrollbar-width: none;
            }

            pre::-webkit-scrollbar {
                display: none;
            }

            pre.frame::-webkit-scrollbar {
                display: block;
                height: 5px;
            }

            pre.frame::-webkit-scrollbar-thumb {
                background: #999;
                border-radius: 5px;
            }

            pre.frame {
                scrollbar-width: thin;
            }

            .message {
                line-height: 1.3;
                font-weight: 600;
                white-space: pre-wrap;
            }

            .message-body {
                color: var(--red);
            }

            .plugin {
                color: var(--purple);
            }

            .file {
                color: var(--cyan);
                margin-bottom: 0;
                white-space: pre-wrap;
                word-break: break-all;
            }

            .frame {
                color: var(--yellow);
            }

            .stack {
                font-size: 13px;
                color: var(--dim);
            }

            .tip {
                font-size: 13px;
                color: #999;
                border-top: 1px dotted #999;
                padding-top: 13px;
                line-height: 1.8;
            }

            code {
                font-size: 13px;
                font-family: var(--monospace);
                color: var(--yellow);
            }

            .file-link {
                text-decoration: underline;
                cursor: pointer;
            }

            kbd {
                line-height: 1.5;
                font-family: ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
                    monospace;
                font-size: 0.75rem;
                font-weight: 700;
                background-color: rgb(38, 40, 44);
                color: rgb(166, 167, 171);
                padding: 0.15rem 0.3rem;
                border-radius: 0.25rem;
                border-width: 0.0625rem 0.0625rem 0.1875rem;
                border-style: solid;
                border-color: rgb(54, 57, 64);
                border-image: initial;
            }
        </style>
    </head>
    <body>
        <div class="backdrop" part="backdrop">
            <div class="window" part="window">
                <pre class="message"><!-- message --></pre>
                <pre class="stack"><!-- stack --></pre>
                <div class="tip">Fix the code to dismiss.</div>
            </div>
        </div>
    </body>
</html>
`;

export interface ParsedCurl {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  auth?: { username: string; password?: string }
}

/**
 * Parses raw cURL command line string into structured object
 */
export function parseCurl(curlCmd: string): ParsedCurl {
  const result: ParsedCurl = {
    url: '',
    method: 'GET',
    headers: {},
  }

  if (!curlCmd || !curlCmd.trim()) return result

  // Normalize multi-line backslashes
  const cleanCmd = curlCmd.replace(/\\\r?\n/g, ' ').trim()

  // Match URL (first standalone quoted string or http/https string not preceded by a flag)
  const urlMatch = cleanCmd.match(/(?:['"])(https?:\/\/[^'"]+)(?:['"])|(?:https?:\/\/[^\s'"]+)/i)
  if (urlMatch) {
    result.url = urlMatch[1] || urlMatch[0]
  }

  // Match Method (-X or --request)
  const methodMatch = cleanCmd.match(/(?:-X|--request)\s+([A-Z]+)/i)
  if (methodMatch) {
    result.method = methodMatch[1].toUpperCase()
  }

  // Match Headers (-H or --header)
  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/gi
  let hMatch
  while ((hMatch = headerRegex.exec(cleanCmd)) !== null) {
    const headerStr = hMatch[1]
    const colonIndex = headerStr.indexOf(':')
    if (colonIndex > -1) {
      const key = headerStr.slice(0, colonIndex).trim()
      const val = headerStr.slice(colonIndex + 1).trim()
      result.headers[key] = val
    }
  }

  // Match Body / Data (-d, --data, --data-raw, --data-binary, --json)
  const dataMatch = cleanCmd.match(/(?:-d|--data|--data-raw|--data-binary|--json)\s+['"]([\s\S]*?)['"](?:\s|$)/)
  if (dataMatch) {
    result.body = dataMatch[1]
    if (!methodMatch && result.method === 'GET') {
      result.method = 'POST'
    }
  }

  // Match Basic Auth (-u or --user)
  const userMatch = cleanCmd.match(/(?:-u|--user)\s+['"]?([^'"\s]+)['"]?/)
  if (userMatch) {
    const [username, password] = userMatch[1].split(':')
    result.auth = { username, password }
  }

  return result
}

/**
 * Converts parsed cURL into various programming languages
 */
export function generateCodeFromCurl(
  curl: ParsedCurl,
  language: 'fetch' | 'axios' | 'python' | 'go' | 'php' | 'rust'
): string {
  const { url = 'https://api.example.com', method = 'GET', headers = {}, body } = curl

  switch (language) {
    case 'fetch': {
      const options: Record<string, unknown> = { method }
      if (Object.keys(headers).length > 0) options.headers = headers
      if (body) {
        try {
          options.body = JSON.parse(body)
        } catch {
          options.body = body
        }
      }

      return `// JavaScript / TypeScript (Fetch API)
const response = await fetch('${url}', {
  method: '${method}',
  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ')},${
    body ? `\n  body: JSON.stringify(${body.startsWith('{') ? body : JSON.stringify(body)}),` : ''
  }
});

const data = await response.json();
console.log(data);`
    }

    case 'axios': {
      return `// JavaScript / TypeScript (Axios)
import axios from 'axios';

const response = await axios({
  method: '${method.toLowerCase()}',
  url: '${url}',
  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ')},${
    body ? `\n  data: ${body.startsWith('{') ? body : JSON.stringify(body)},` : ''
  }
});

console.log(response.data);`
    }

    case 'python': {
      const headersPython = Object.entries(headers)
        .map(([k, v]) => `    "${k}": "${v}"`)
        .join(',\n')

      return `# Python (requests)
import requests

url = "${url}"
headers = {
${headersPython}
}
${body ? `data = ${body.startsWith('{') ? body : `"${body}"`}\n` : ''}
response = requests.${method.toLowerCase()}(
    url,
    headers=headers,${body ? `\n    json=data if isinstance(data, dict) else None,` : ''}
)

print(response.status_code)
print(response.json())`
    }

    case 'go': {
      return `// Go (net/http)
package main

import (
\t"fmt"
\t"io"
\t"net/http"${body ? '\n\t"strings"' : ''}
)

func main() {
\turl := "${url}"
\tclient := &http.Client{}

\treq, err := http.NewRequest("${method}", url, ${body ? `strings.NewReader(\`${body}\`)` : 'nil'})
\tif err != nil {
\t\tpanic(err)
\t}

${Object.entries(headers)
  .map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`)
  .join('\n')}

\tresp, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer resp.Body.Close()

\tbodyText, _ := io.ReadAll(resp.Body)
\tfmt.Println(string(bodyText))
}`
    }

    case 'php': {
      return `<?php
// PHP cURL
$ch = curl_init('${url}');

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
${Object.entries(headers).map(([k, v]) => `    '${k}: ${v}',`).join('\n')}
]);
${body ? `curl_setopt($ch, CURLOPT_POSTFIELDS, '${body.replace(/'/g, "\\'")}');\n` : ''}
$response = curl_exec($ch);
curl_close($ch);

echo $response;`
    }

    case 'rust': {
      return `// Rust (reqwest async)
use reqwest::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let response = client
        .${method.toLowerCase()}("${url}")
${Object.entries(headers).map(([k, v]) => `        .header("${k}", "${v}")`).join('\n')}
${body ? `        .body(r#"${body}"#)\n` : ''}        .send()
        .await?;

    let body = response.text().await?;
    println!("{}", body);
    Ok(())
}`
    }
  }
}

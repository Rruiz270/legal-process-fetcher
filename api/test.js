export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send('<h1>Test Page</h1><p>Simple test to verify endpoint works</p>');
}
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.1',
    environment: 'production'
  });
}
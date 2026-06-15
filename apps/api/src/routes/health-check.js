export default async (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        integratedAiEnabled: true,
    });
};
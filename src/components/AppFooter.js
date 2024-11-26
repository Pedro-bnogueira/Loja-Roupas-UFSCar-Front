import React from 'react';
import { Box, Typography, Link } from '@mui/material';

function AppFooter() {
    return (
        <Box
            component="footer"
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e0e0e0',
                width: '100%',
                height: '60px',
            }}
        >
            <Typography variant="body2" color="textSecondary">
                <strong>
                    Desenvolvido por{' '}
                    <p color="inherit" underline="none">
                        Trupe da diária
                    </p>
                    .
                </strong>
            </Typography>
        </Box>
    );
}

export default AppFooter;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    TextField, 
    Button, 
    Container, 
    Typography, 
    Box,
    Card,
    CardContent
} from '@mui/material';
import tripService from '../api/trips';
import { useAuth } from '../contexts/AuthContext';

const JoinTripPage = () => {
    const [tripCode, setTripCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tripCode) {
            setError('Please enter a trip code');
            return;
        }
        
        try {
            await tripService.joinTrip(tripCode, user.access);
            setSuccess('Successfully joined the trip!');
            setError('');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError('Failed to join trip. Please check the code and try again.');
            setSuccess('');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Card sx={{ width: '100%' }}>
                    <CardContent>
                        <Typography component="h1" variant="h5" align="center" gutterBottom>
                            Join a Trip
                        </Typography>
                        {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}
                        {success && <Typography color="success.main" align="center" sx={{ mb: 2 }}>{success}</Typography>}
                        
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Trip Code"
                                autoFocus
                                value={tripCode}
                                onChange={(e) => setTripCode(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Join Trip
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default JoinTripPage;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Box, 
    Button, 
    Grid, 
    Card, 
    CardContent,
    Chip,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Menu,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    Avatar,
    InputAdornment
} from '@mui/material';
import { 
    Add, 
    MoreVert, 
    ThumbUp, 
    ThumbDown, 
    PersonAdd,
    Share,
    Edit,
    Delete
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import tripService from '../api/trips';
import { useAuth } from '../contexts/AuthContext';
import ActivityItem from '../components/ActivityItem';

ChartJS.register(ArcElement, Tooltip, Legend);

const TripDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activityDialogOpen, setActivityDialogOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    
    // New activity form state
    const [activityTitle, setActivityTitle] = useState('');
    const [activityDate, setActivityDate] = useState(null);
    const [activityTime, setActivityTime] = useState('');
    const [activityCategory, setActivityCategory] = useState('OT');
    const [activityCost, setActivityCost] = useState('');
    const [activityNotes, setActivityNotes] = useState('');
    
    const fetchTrip = async () => {
        try {
            const data = await tripService.getTrip(id, user.access);
            setTrip(data);
        } catch (err) {
            console.error('Failed to fetch trip:', err);
            setError('Failed to load trip details');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchTrip();
    }, [id, user.access]);
    
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    const handleDeleteTrip = async () => {
        try {
            await tripService.deleteTrip(id, user.access);
            navigate('/');
        } catch (err) {
            console.error('Failed to delete trip:', err);
            setError('Failed to delete trip');
        }
    };
    
    const handleInviteUser = async () => {
        try {
            await tripService.inviteUser(id, email, user.access);
            setEmail('');
            setInviteDialogOpen(false);
            fetchTrip(); // Refresh trip data
        } catch (err) {
            console.error('Failed to invite user:', err);
            setError('Failed to invite user');
        }
    };
    
    const handleCreateActivity = async () => {
        try {
            const activityData = {
                title: activityTitle,
                date: activityDate.toISOString().split('T')[0],
                time: activityTime || null,
                category: activityCategory,
                estimated_cost: activityCost || null,
                notes: activityNotes || null,
            };
            
            await tripService.createActivity(id, activityData, user.access);
            setActivityDialogOpen(false);
            resetActivityForm();
            fetchTrip(); // Refresh trip data
        } catch (err) {
            console.error('Failed to create activity:', err);
            setError('Failed to create activity');
        }
    };
    
    const resetActivityForm = () => {
        setActivityTitle('');
        setActivityDate(null);
        setActivityTime('');
        setActivityCategory('OT');
        setActivityCost('');
        setActivityNotes('');
    };
    
    const handleVote = async (activityId, vote) => {
        try {
            await tripService.voteActivity(id, activityId, vote, user.access);
            fetchTrip(); // Refresh trip data
        } catch (err) {
            console.error('Failed to vote:', err);
            setError('Failed to record vote');
        }
    };
    
    if (loading) {
        return (
            <Container>
                <Typography>Loading...</Typography>
            </Container>
        );
    }
    
    if (!trip) {
        return (
            <Container>
                <Typography color="error">{error || 'Trip not found'}</Typography>
            </Container>
        );
    }
    
    // Prepare data for budget chart
    const budgetData = {
        labels: trip.activities.map(activity => activity.title),
        datasets: [
            {
                data: trip.activities.map(activity => activity.estimated_cost || 0),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
            }
        ]
    };
    
    // Group activities by date
    const activitiesByDate = {};
    trip.activities.forEach(activity => {
        const date = activity.date;
        if (!activitiesByDate[date]) {
            activitiesByDate[date] = [];
        }
        activitiesByDate[date].push(activity);
    });
    
    return (
        <Container maxWidth="lg">
            {/* Trip Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    {trip.name}
                </Typography>
                
                <Box>
                    <IconButton onClick={handleMenuOpen}>
                        <MoreVert />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => { navigate(`/trips/${id}/edit`); handleMenuClose(); }}>
                            <Edit sx={{ mr: 1 }} /> Edit Trip
                        </MenuItem>
                        {trip.created_by.id === user.id && (
                            <MenuItem onClick={() => { handleDeleteTrip(); handleMenuClose(); }}>
                                <Delete sx={{ mr: 1 }} /> Delete Trip
                            </MenuItem>
                        )}
                    </Menu>
                </Box>
            </Box>
            
            {/* Trip Info */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Trip Details
                            </Typography>
                            <Typography>
                                <strong>Dates:</strong> {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                            </Typography>
                            {trip.group_budget && (
                                <Typography>
                                    <strong>Group Budget:</strong> ${trip.group_budget}
                                </Typography>
                            )}
                            <Typography>
                                <strong>Created by:</strong> {trip.created_by.username}
                            </Typography>
                            
                            <Box sx={{ mt: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<PersonAdd />}
                                    onClick={() => setInviteDialogOpen(true)}
                                    sx={{ mr: 2 }}
                                >
                                    Invite
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<Share />}
                                    onClick={() => navigator.clipboard.writeText(trip.trip_code)}
                                >
                                    Copy Trip Code
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Participants
                            </Typography>
                            <List>
                                {trip.participants.map(participant => (
                                    <ListItem key={participant.user.id}>
                                        <Avatar sx={{ mr: 2 }}>
                                            {participant.user.username.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <ListItemText 
                                            primary={participant.user.username}
                                            secondary={participant.user.email}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            {/* Budget Visualization */}
            {trip.activities.some(a => a.estimated_cost) && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Budget Breakdown
                    </Typography>
                    <Box sx={{ height: '300px' }}>
                        <Pie data={budgetData} />
                    </Box>
                </Box>
            )}
            
            {/* Activities */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">
                        Activities
                    </Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<Add />}
                        onClick={() => setActivityDialogOpen(true)}
                    >
                        Add Activity
                    </Button>
                </Box>
                
                {Object.entries(activitiesByDate).map(([date, activities]) => (
                    <Box key={date} sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {new Date(date).toLocaleDateString()}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            {activities.map(activity => (
                                <Grid item xs={12} sm={6} md={4} key={activity.id}>
                                    <ActivityItem 
                                        activity={activity}
                                        onVote={handleVote}
                                        currentUserId={user.id}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
                
                {trip.activities.length === 0 && (
                    <Typography variant="body1" color="text.secondary">
                        No activities added yet. Click "Add Activity" to get started!
                    </Typography>
                )}
            </Box>
            
            {/* Error Display */}
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}
            
            {/* Add Activity Dialog */}
            <Dialog open={activityDialogOpen} onClose={() => setActivityDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Activity</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={activityTitle}
                            onChange={(e) => setActivityTitle(e.target.value)}
                            sx={{ mb: 2 }}
                            required
                        />
                        
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Date"
                                value={activityDate}
                                onChange={(newValue) => setActivityDate(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} fullWidth sx={{ mb: 2 }} required />
                                )}
                            />
                        </LocalizationProvider>
                        
                        <TextField
                            fullWidth
                            label="Time (optional)"
                            type="time"
                            value={activityTime}
                            onChange={(e) => setActivityTime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />
                        
                        <TextField
                            fullWidth
                            label="Category"
                            select
                            value={activityCategory}
                            onChange={(e) => setActivityCategory(e.target.value)}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="AD">Adventure</MenuItem>
                            <MenuItem value="FD">Food</MenuItem>
                            <MenuItem value="ST">Sightseeing</MenuItem>
                            <MenuItem value="OT">Other</MenuItem>
                        </TextField>
                        
                        <TextField
                            fullWidth
                            label="Estimated Cost (optional)"
                            type="number"
                            value={activityCost}
                            onChange={(e) => setActivityCost(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            sx={{ mb: 2 }}
                        />
                        
                        <TextField
                            fullWidth
                            label="Notes (optional)"
                            multiline
                            rows={3}
                            value={activityNotes}
                            onChange={(e) => setActivityNotes(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActivityDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleCreateActivity} 
                        variant="contained"
                        disabled={!activityTitle || !activityDate}
                    >
                        Add Activity
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Invite User Dialog */}
            <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
                <DialogTitle>Invite User to Trip</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email Address"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleInviteUser} 
                        variant="contained"
                        disabled={!email}
                    >
                        Invite
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TripDetailPage;
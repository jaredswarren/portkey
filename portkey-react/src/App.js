import logo from './logo.svg';
import './App.css';
import '@fontsource/roboto';
import Grid from "@material-ui/core/Grid";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogActions from "@material-ui/core/DialogActions"
import TextField from "@material-ui/core/TextField"

function App() {
  const [anchorEl, setMainMenuAnchorEl] = React.useState(null);
  const [markDialogAnchorEl, setMarkDialogAnchorEl] = React.useState(null);
  const [loginDialogAnchorEl, setLoginDialogAnchorEl] = React.useState(null);
  const [signupDialogAnchorEl, setSignupDialogAnchorEl] = React.useState(null);

  const handleClickMainMenu = (event) => {
    setMainMenuAnchorEl(event.currentTarget);
  };

  const handleMainMenuClose = () => {
    setMainMenuAnchorEl(null);
  };

  const handleMarkDialogOpen = (event) => {
    setMainMenuAnchorEl(null)
    setMarkDialogAnchorEl(event.currentTarget)
  }

  const handleMarkDialogClose = (event) => {
    setMarkDialogAnchorEl(null)
  };

  const handleLoginDialogOpen = (event) => {
    setMainMenuAnchorEl(null)
    setLoginDialogAnchorEl(event.currentTarget)
  }

  const handleSignupDialogOpen = (event) => {
    setMainMenuAnchorEl(null)
    setSignupDialogAnchorEl(event.currentTarget)
  }

  const handleSignupDialogSignup = (event) => {
    setSignupDialogAnchorEl(null)
  }

  const handleSignupDialogCancel = (event) => {
    setSignupDialogAnchorEl(null)
  }
  
  const handleSignupDialogClose = (event) => {
    setSignupDialogAnchorEl(null)
  }

  return (
    <Grid container direction="column" justifyContent="center" alignItems="center">
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon aria-controls="simple-menu" aria-haspopup="true" onClick={handleClickMainMenu} />
          </IconButton>
          <Typography variant="h6" >
            portkey.to
          </Typography>
        </Toolbar>
      </AppBar>
      <Menu id="main-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMainMenuClose}>
        <MenuItem onClick={handleMarkDialogOpen}>Add Mark</MenuItem>
        <MenuItem onClick={handleLoginDialogOpen}>Login</MenuItem>
        <MenuItem onClick={handleSignupDialogOpen}>Sign Up</MenuItem>
      </Menu>
      <Dialog onClose={handleMarkDialogClose} open={Boolean(markDialogAnchorEl)}>
        <DialogTitle id="addMarkDialogTitle">Add a mark</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add a mark and a destination, fill this out.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="markField"
            label="Mark"
            fullWidth
          />
          <TextField
            margin="dense"
            id="destinationField"
            label="Destination"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMarkDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleMarkDialogClose} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog onClose={handleSignupDialogClose} open={Boolean(signupDialogAnchorEl)}>
        <DialogTitle id="singupDialogTitle">Signup for portkey.to</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide your email address, password, and a username that will be visible to those who follow your portkey marks.
          </DialogContentText>
          <TextField 
            autoFocus
            margin="dense"
            id="signupEmailField"
            label="Email Address"
            fullWidth/>
          <TextField 
            margin="dense"
            id="signupPasswordField"
            label="Password"
            type="password"
            fullWidth/>
          <TextField 
            margin="dense"
            id="signupUsernameField"
            label="Username"
            fullWidth/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSignupDialogSignup} color="primary">Signup</Button>
          <Button onClick={handleSignupDialogCancel} color="primary">Cancel</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default App;

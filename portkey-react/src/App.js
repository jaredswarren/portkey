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
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { AttributeType, CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import AccountCircle from '@material-ui/icons/AccountCircle';


function App() {
  const AWS_REGION = "us-east-1"
  const AWS_COGNITO_USER_POOL_ID = "us-east-1_iGJsO2gQ1"
  const AWS_COGNITO_APP_ID = "t1g6v4psd4b0u7ft9jfoff407"

  const cognitoConfig = {}
  cognitoConfig.region = AWS_REGION

  const poolData = {
    UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
    ClientId: process.env.AWS_COGNITO_APP_ID
  };

  const [anchorEl, setMainMenuAnchorEl] = React.useState(null);
  const [markDialogAnchorEl, setMarkDialogAnchorEl] = React.useState(null);
  const [loginDialogAnchorEl, setLoginDialogAnchorEl] = React.useState(null);
  const [signupDialogAnchorEl, setSignupDialogAnchorEl] = React.useState(null);
  const [signupUsername, setSignupUsername] = React.useState(null);
  const [signupEmail, setSignupEmail] = React.useState(null);
  const [signupPassword, setSignupPassword] = React.useState(null);
  const [messageDialogText, setMessageDialogText] = React.useState(null);
  const [loginUsername, setLoginUsername] = React.useState(null);
  const [loginPassword, setLoginPassword] = React.useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(null);

  var accessToken = null;
  var idToken = null;
  var refreshToken = null;
  var accessTokenExpirationTime = null;
  var deviceGroupKey = null;
  var deviceKey = null;

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
    setSignupUsername(null)
    setSignupPassword(null)
    setSignupEmail(null)
    setMainMenuAnchorEl(null)
    setSignupDialogAnchorEl(event.currentTarget)
  }

  async function executeSignup(event) {
    // async/await.
    const cognitoIdpClient = new CognitoIdentityProviderClient(cognitoConfig)
    const signup = {}
    signup.Username = signupUsername
    signup.Password = signupPassword

    const userAttributes = []

    const attr = {
      Name: 'email',
      Value: signupEmail
    }

    userAttributes.push(attr)

    signup.UserAttributes = userAttributes
    signup.ClientId = AWS_COGNITO_APP_ID
    const command = new SignUpCommand(signup)
    try {
      const data = await cognitoIdpClient.send(command);
      console.log("Signup attempt complete")
      console.log(data)
      let httpStatusCode = data.$metadata.httpStatusCode
      let verified = data.UserConfirmed
      let message = ""
      if (verified) {
        message = "User signup complete. Please login."
      } else {
        message = "User signup complete, but your account is not verified. "
        let deliveryMethod = data.CodeDeliveryDetails.DeliveryMedium
        if (deliveryMethod == "EMAIL") {
          message += "Please check your email for verification instructions."
        } else if (deliveryMethod == "SMS") {
          message += "Please check your text messages for verification instructions."
        }
      }
      setSignupDialogAnchorEl(null)
      setMessageDialogText(message)
    } catch (error) {
      console.log("Error while executing signup.")
      console.log(error)
      if (error.name == "UsernameExistsException") {
        setSignupDialogAnchorEl(null)
        setMessageDialogText(error.message)
      }
    } finally {
      // finally.
    }
    setSignupDialogAnchorEl(null)
  }

  async function executeLoginAttempt(event) {
    const cognitoIdpClient = new CognitoIdentityProviderClient(cognitoConfig)
    let username = loginUsername
    let password = loginPassword
    let input = {
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      },
      ClientId: AWS_COGNITO_APP_ID
    }
    try {
      const command = new InitiateAuthCommand(input)
      const data = await cognitoIdpClient.send(command);
      console.log("Login attempt complete")
      console.log(data)
      let loginStatusCode = data.$metadata.httpStatusCode
      if (loginStatusCode != 200) {
        setMessageDialogText("Unexpected response during authentication.")
        setLoginDialogAnchorEl(null)
        return
      }
      accessToken = data.AuthenticationResult.AccessToken
      idToken = data.AuthenticationResult.IdToken
      refreshToken = data.AuthenticationResult.RefreshToken
      deviceGroupKey = data.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey
      deviceKey = data.AuthenticationResult.NewDeviceMetadata.DeviceKey
      accessTokenExpirationTime = data.AuthenticationResult.ExpiresIn + (new Date().getTime() / 1000);

    } catch (error) {
      console.log("Error handling login attempt")
      console.log(error)
      if (error.name == "UserNotConfirmedException") {
        setLoginDialogAnchorEl(null)
        setMessageDialogText("Your user has not been verified.")
      } else if (error.name == "NotAuthorizedException") {
        setLoginDialogAnchorEl(null)
        setMessageDialogText(error.message)
      } else {
        setLoginDialogAnchorEl(null)
        setMessageDialogText(error.message)
      }

    } finally {
      //finally.
    }
  }

  const handleMessageDialogClose = (event) => {
    setMessageDialogText(null)
  }

  const handleSignupDialogCancel = (event) => {
    setSignupUsername(null)
    setSignupPassword(null)
    setSignupEmail(null)
    setMainMenuAnchorEl(null)
    setSignupDialogAnchorEl(null)
  }

  const handleSignupDialogSignup = (event) => {
    executeSignup(event)
  }

  const handleSignupDialogClose = (event) => {
    setSignupDialogAnchorEl(null)
  }

  const handleLoginDialogCancel = (event) => {
    setMainMenuAnchorEl(null)
    setLoginDialogAnchorEl(null)
  }

  const handleLoginDialogLogin = (event) => {
    executeLoginAttempt(event)
    setMainMenuAnchorEl(null)
    setLoginDialogAnchorEl(null)
  }

  const handleLoginDialogClose = (event) => {
    setMainMenuAnchorEl(null)
    setLoginDialogAnchorEl(null)
  }

  const handleProfileMenuOpen = (event) => {

  }

  const handleProfileMenuClose = (event) => {

  }

  const handleProfileDialogOpen = (event) => {

  }

  const handleMyAccountDialogOpen = (event) => {

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
          <div>
          <IconButton
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
          <AccountCircle />
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={profileMenuOpen}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileDialogOpen}>Profile</MenuItem>
            <MenuItem onClick={handleMyAccountDialogOpen}>My account</MenuItem>
          </Menu>
          </div>
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
        <DialogTitle id="messageDialogTitle">Signup for portkey.to</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide your email address, password, and a username that will be visible to users of the site.
          </DialogContentText>
          <TextField
            value={signupUsername}
            onChange={(e) => setSignupUsername(e.target.value)}
            margin="dense"
            id="signupUsernameField"
            label="Username"
            fullWidth />
          <TextField
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            margin="dense"
            id="signupPasswordField"
            label="Password"
            type="password"
            fullWidth />
          <TextField
            autoFocus
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            margin="dense"
            id="signupEmailField"
            label="Email Address"
            type="email"
            fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSignupDialogSignup} color="primary">Signup</Button>
          <Button onClick={handleSignupDialogCancel} color="primary">Cancel</Button>
        </DialogActions>
      </Dialog>
      <Dialog onClose={handleMessageDialogClose} open={Boolean(messageDialogText)}>
        <DialogContent>
          <DialogContentText>
            {messageDialogText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMessageDialogClose} color="primary">Ok</Button>
        </DialogActions>
      </Dialog>
      <Dialog onClose={handleLoginDialogClose} open={Boolean(loginDialogAnchorEl)}>
        <DialogTitle id="loginDialogTitle">Login</DialogTitle>
        <DialogContent>
          <TextField
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            margin="dense"
            id="loginUsernameField"
            label="Username"
            fullWidth />
          <TextField
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            margin="dense"
            id="loginPasswordField"
            label="Password"
            type="password"
            fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginDialogLogin} color="primary">Login</Button>
          <Button onClick={handleLoginDialogCancel} color="primary">Cancel</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default App;

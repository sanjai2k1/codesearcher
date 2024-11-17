import React, { useState,useEffect, useRef} from 'react';
import { Box, Typography, TextField, Button, Paper, Avatar, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer"; // Import the icon
import axios from "axios";



const renderLoading = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      padding: "8px 16px",
    }}
  >
    <CircularProgress size={24} color="primary" />
  </Box>);

const ChatBubble = ({ message, sender = "user", type = "text" , isLoading = false}) => {
  const renderCode = (code) => (
    <Paper
      sx={{
        padding: "16px 24px",
        backgroundColor: "#f4f7fc", // Softer, more neutral background
        borderRadius: "12px", // Rounded corners for a more modern look
        overflowX: "auto", // Horizontal scroll for wide code lines
        maxWidth: "90%", // Restrict maximum width
        whiteSpace: "pre-wrap", // Preserve line breaks
        wordBreak: "break-word", // Prevent overflow
        fontFamily: "'Source Code Pro', monospace", // Modern, popular coding font
        fontSize: "15px", // Slightly larger font size for better readability
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)", // Smooth, subtle shadow
        margin: "12px 0", // Extra margin for spacing
        transition: "all 0.3s ease", // Smooth transition for hover effects
        "&:hover": {
          boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)", // Darker shadow on hover
          backgroundColor: "#e7effb", // Slight change in background on hover
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "#2c3e50", // Darker text color for better contrast
          lineHeight: 1.8, // Adjusted line height for better readability
          fontWeight: 500, // Slightly heavier font for emphasis
          letterSpacing: "0.5px", // Add a bit of spacing for a modern feel
        }}
      >
        {code}
      </Typography>
    </Paper>
  );
  
  const renderFolderPath = (path) => (
    <Paper
      sx={{
        padding: "12px 16px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        maxWidth: "90%", // Restrict maximum width
        margin: "4px 0",
        wordBreak: "break-word", // Prevent horizontal overflow
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "#0d47a1",
          lineHeight: 1.6,
          textDecoration: "underline",
          "&:hover": {
            textDecoration: "none",
          },
        }}
      >
        {path}
      </Typography>
    </Paper>
  );
  const renderLoading = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        padding: "8px 16px",
      }}
    >
      <CircularProgress size={24} color="primary" />
    </Box>
  );
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start", // Align based on sender
        alignItems: "flex-start",
        width: "100%",
        padding: "8px 16px",
        gap: "8px",
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          backgroundColor: sender === "bot" ? "#81D4FA" : "#A5D6A7",
          flexShrink: 0,
        }}
      >
        <QuestionAnswerIcon sx={{ fontSize: 20, color: "#fff" }} />
      </Avatar>
      <Box
        sx={{
          maxWidth: "60%", // Restrict maximum width for the container
        }}
      >
      {isLoading ? (
          renderLoading() // Show loading spinner if isLoading is true
        ) : (
          <>
            {type === "text" && (
              <Paper
                elevation={2}
                sx={{
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: sender === "user" ? "#e8f5e9" : "#f1f1f1",
                  textAlign: "left",
                  wordBreak: "break-word",
                  margin: "4px 0",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: sender === "user" ? "#2e7d32" : "#424242",
                    lineHeight: 1.6,
                    fontSize: "14px",
                  }}
                >
                  {message}
                </Typography>
              </Paper>
            )}
            {type === "code" && renderCode(message)}
            {type === "folder" && renderFolderPath(message)}
          </>
        )}
      </Box>
    </Box>
  );
};














function App() {
  const [message, setMessage] = useState("");  // State to hold the current message input
  const [messages, setMessages] = useState([]); // State to hold the array of messages
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);
  // Handle input change
  const handleInputChange = (event) => {
    setMessage(event.target.value); // Update message state on input change
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (message.trim()) {
      setMessages([...messages, { message, sender: "user", type: "text" }]);
      setIsLoading(true); // Show loading spinner
      setMessage("")
      // Fetch response
      const fetchData = async () =>{
        try {
          const response = await axios.post("http://localhost:8080/query", { query: message.trim() });
          console.log("Response:", response.data);
          if (response.data.message) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { message: response.data.message, sender: "bot", type: "text" },
            ]);
          }
          if (response.data.code) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { message: response.data.code, sender: "bot", type: "code" },
            ]);
          }
          if (response.data.folder) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { message: response.data.folder, sender: "bot", type: "folder" },
            ]);
          }
        } catch (error) {
          if (error.response) {
            // Server responded with a status code out of the range of 2xx
            console.error("Error Response Status:", error.response.status);
            console.error("Error Response Data:", error.response.data);
          } else if (error.request) {
            // Request was made but no response was received
            console.error("No Response:", error.request);
            setMessages((prevMessages) => [
              ...prevMessages,
              { message: "No Response", sender: "bot", type: "text" },
            ]);
          } else {
            // Something happened in setting up the request
            console.error("Error Message:", error.message);
          }
        }      
      // Process the response
     
      
      setIsLoading(false); // Hide loading spinner
    }
fetchData()

    }
  };
  
  return (
    <Box
    sx={{
      minHeight: "100vh",
      width: "100%",
            display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #E0F7FA, #B3E5FC)",
    }}
  >
<Box
  sx={{
    position: "relative",
    height: "100vh", // Full viewport height
    width: "80%",
    maxWidth: "800px",
    background: "rgba(255, 255, 255, 1)",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden", // Prevent horizontal overflow
  }}
>
  {/* Chat Messages */}
  <Box
    sx={{
      flex: 1,
      width: "100%",
      overflowY: "auto", // Allow vertical scrolling
      overflowX: "hidden", // Hide horizontal overflow
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      alignItems: "flex-start", // Align to the left by default (for bot)
      justifyContent: "flex-start",
      wordWrap: "break-word", // Wrap long words to prevent overflow
      overflowWrap: "break-word", // Ensures long words break and wrap within the box
    }}
  >
    {/* Static chat messages */}
    {/* <ChatBubble message="Hello, How can I help you?" sender="bot" type="text" />
    <ChatBubble message="Hello, How can I help you?" sender="bot" type="text" />
    <ChatBubble message="Hello, this is a regular message." sender="user" type="text" />
    <ChatBubble message="Hello, this is a regular message." sender="user" type="text" />
    <ChatBubble message="const greet = () => console.log('Hello');" sender="bot" type="code" />
    <ChatBubble message="/usr/local/bin/my-file.txt" sender="bot" type="folder" /> */}

    {/* Dynamic messages */}
    {messages.map((msg, index) => (
      <ChatBubble key={index} message={msg.message} sender={msg.sender} type={msg.type} />
    ))}
    {isLoading ? renderLoading() : <></>}
    <div ref={messagesEndRef} />

  </Box>

  {/* Input and Button Fixed to Bottom */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      padding: "12px 16px",
      background: "#fff",
      boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
      borderTop: "1px solid #e0e0e0",
    }}
  >
    <TextField
      variant="outlined"
      fullWidth
      placeholder="Type your message..."
      value={message} // Bind input value to state
      onChange={handleInputChange} // Update state when input changes
      sx={{
        backgroundColor: "#F9FAFB",
        borderRadius: "20px",
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#E0E0E0",
          },
          "&:hover fieldset": {
            borderColor: "#B3E5FC",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#81D4FA",
          },
        },
        "& .MuiInputBase-input": {
          fontSize: "16px",
        },
      }}
    />
    <Button
      variant="contained"
      color="primary"
      endIcon={<SendIcon />}
      onClick={handleSendMessage} // Call send function when button is clicked
      sx={{
        height: "50px",
        minWidth: "100px",
        marginLeft: "16px",
        textTransform: "none",
        borderRadius: "8px",
        backgroundColor: "#29B6F6",
        "&:hover": {
          backgroundColor: "#0288D1",
        },
      }}
      disabled={loading || !message.trim()}
    >
      {loading ? "Sending..." : "Send"}
    </Button>
  </Box>
</Box>





  </Box>

  );
}

export default App;

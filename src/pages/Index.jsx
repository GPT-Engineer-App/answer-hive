import React, { useState, useEffect } from "react";
import { Box, Heading, Text, Button, Input, Textarea, Stack, useToast, Flex, Spacer } from "@chakra-ui/react";
import { FaSignInAlt, FaSignOutAlt, FaQuestionCircle, FaArrowUp } from "react-icons/fa";

const API_URL = "https://backengine-k0m1.fly.dev";

const Index = () => {
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await fetch(`${API_URL}/questions`);
    const data = await res.json();
    setQuestions(data);
  };

  const handleLogin = async () => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setAccessToken(data.accessToken);
      setIsLoggedIn(true);
      toast({
        title: "Logged in",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Login failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSignup = async () => {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 204) {
      toast({
        title: "Signup successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Signup failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAskQuestion = async () => {
    const res = await fetch(`${API_URL}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (res.ok) {
      setTitle("");
      setContent("");
      fetchQuestions();
      toast({
        title: "Question posted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed to post question",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAnswerQuestion = async (questionId, answerContent) => {
    const res = await fetch(`${API_URL}/questions/${questionId}/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content: answerContent }),
    });

    if (res.ok) {
      fetchQuestions();
      toast({
        title: "Answer posted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed to post answer",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleVote = async (type, id) => {
    const res = await fetch(`${API_URL}/votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ type, id }),
    });

    if (res.ok) {
      fetchQuestions();
    }
  };

  return (
    <Box p={4}>
      <Flex align="center" mb={4}>
        <Heading size="xl">Yahoo Answers Clone</Heading>
        <Spacer />
        {isLoggedIn ? (
          <Button leftIcon={<FaSignOutAlt />} onClick={() => setIsLoggedIn(false)}>
            Logout
          </Button>
        ) : (
          <>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} mr={2} />
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} mr={2} />
            <Button leftIcon={<FaSignInAlt />} onClick={handleLogin} mr={2}>
              Login
            </Button>
            <Button onClick={handleSignup}>Signup</Button>
          </>
        )}
      </Flex>

      {isLoggedIn && (
        <Box mb={4}>
          <Heading size="lg" mb={2}>
            Ask a Question
          </Heading>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} mb={2} />
          <Textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} mb={2} />
          <Button leftIcon={<FaQuestionCircle />} onClick={handleAskQuestion}>
            Ask
          </Button>
        </Box>
      )}

      <Heading size="lg" mb={2}>
        Questions
      </Heading>
      <Stack spacing={4}>
        {questions.map((question) => (
          <Box key={question.id} borderWidth={1} p={4}>
            <Heading size="md">{question.title}</Heading>
            <Text>{question.content}</Text>
            <Button size="sm" leftIcon={<FaArrowUp />} onClick={() => handleVote("question", question.id)}>
              Upvote
            </Button>

            {isLoggedIn && (
              <Box mt={4}>
                <Heading size="sm">Answer this question</Heading>
                <Textarea placeholder="Your answer" onChange={(e) => (question.answerContent = e.target.value)} mb={2} />
                <Button size="sm" onClick={() => handleAnswerQuestion(question.id, question.answerContent)}>
                  Submit Answer
                </Button>
              </Box>
            )}

            {question.answers && (
              <Box mt={4}>
                <Heading size="sm">Answers</Heading>
                <Stack mt={2}>
                  {question.answers.map((answer) => (
                    <Box key={answer.id} borderWidth={1} p={2}>
                      <Text>{answer.content}</Text>
                      <Button size="xs" leftIcon={<FaArrowUp />} onClick={() => handleVote("answer", answer.id)}>
                        Upvote
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default Index;

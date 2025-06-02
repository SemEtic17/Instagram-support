import express from "express";

const app = express();
app.use(express.json());

const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 3, name: "Doe" },
];

// API that returns a list of users
app.get("/users", (req, res) => {
  try {
    res
      .send(users.map((user, i) => `Id: ${user.id} Name: ${user.name}`))
      .status(200)
      .json(users);
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

// API that create users
app.post("/users", (req, res) => {
  try {
    const user = req.body;
    users.push(user);
    res
      .send(`User ${user.name} created with id ${user.id}`)
      .status(201)
      .json(user);
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

// API that delete users by id
app.delete("/users/:idd", (req, res) => {
  try {
    const idd = parseInt(req.params.idd); // Convert id to number
    const userIndex = users.findIndex((user) => user.id === idd);

    if (userIndex === -1) {
      return res.status(404).json({ message: `User not found with id ${idd}` });
    }

    users.splice(userIndex, 1); // Remove user from array
    res.status(200).json({ message: `User with id ${idd} deleted`, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

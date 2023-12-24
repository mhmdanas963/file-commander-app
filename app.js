const fsPromise = require("fs/promises");

(async () => {
  // Creates the file in the specified path
  const createFile = async (path) => {
    let newFileHandler;

    try {
      // Checks is the file already exists, if not it throws an error and catch block executes
      newFileHandler = await fsPromise.open(path, "r");
      // Exit the function is file exists
      console.log(`The file ${path} already exists`);
    } catch (e) {
      // Creating the new file
      newFileHandler = await fsPromise.open(path, "w");
      console.log("File created successfully");
    } finally {
      // Close the opened file
      newFileHandler.close();
    }
  };

  const CREATE_FILE = "create a file";

  // Open the file to read data from it
  const commandFileHandler = await fsPromise.open("./command.txt", "r");

  // change event
  commandFileHandler.on("change", async () => {
    // Size of the file
    const fileSize = (await commandFileHandler.stat()).size;

    // Arguments of read()
    const buff = Buffer.alloc(fileSize);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    // Reading data from the file
    await commandFileHandler.read(buff, offset, length, position);

    // Decoding the data
    const command = buff.toString("utf-8");

    // Checking the command
    if (command.includes(CREATE_FILE)) {
      // Gets the path from the command
      const filePath = command.substring(CREATE_FILE.length + 1);

      // Calling createFile function
      await createFile(filePath);
    }
  });

  // Watch the file "command.txt"
  const watcher = fsPromise.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      // emitting change event
      commandFileHandler.emit("change");
    } else {
      break;
    }
  }

  await commandFileHandler.close();
})();

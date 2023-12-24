const fsPromise = require("fs/promises");

(async () => {
  const CREATE_FILE = "create the file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_CONTENT = "add content to the file";

  // Creates the file in the specified path
  const createFile = async (filePath) => {
    let newFileHandler;

    try {
      // Checks is the file already exists, if not it throws an error and catch block executes
      newFileHandler = await fsPromise.open(filePath, "r");
      // Exit the function is file exists
      console.log(`The file ${filePath} already exists`);
    } catch (e) {
      // Creating the new file
      newFileHandler = await fsPromise.open(filePath, "w");
      console.log("File created successfully");
    } finally {
      // Close the opened file
      newFileHandler.close();
    }
  };

  // Deletes the file specified in the path
  const deleteFile = async (filePath) => {
    try {
      const deleted = await fsPromise.unlink(filePath);
      if (deleted === undefined) {
        console.log("File was deleted successfully");
      } else {
        throw new Error("Error in deleting the file");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Rename the file specified in the path to the name specified in the new path
  const renameFile = async (filePath, newFilePath) => {
    try {
      const renamed = await fsPromise.rename(filePath, newFilePath);
      if (renamed === undefined) {
        console.log("File was renamed successfully");
      } else {
        throw new Error("Error in renaming the file");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Writes the content to the specified file
  const addContent = async (filePath, content) => {
    let fileHandler;

    try {
      fileHandler = await fsPromise.open(filePath, "w");
      await fileHandler.write(content); // the buffer to write, offset, length, position
      console.log(`The content is written to the ${filePath}`);
    } catch (e) {
      console.log(e.message);
    } finally {
      fileHandler.close();
    }
  };

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

    // Creates a file <path>
    if (command.includes(CREATE_FILE)) {
      // Gets the path from the command
      const filePath = command.substring(CREATE_FILE.length + 1);

      // Calling createFile function
      await createFile(filePath);
    }

    // Delete the file <path>
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    // Rename the file <path> to <path>
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const filePath = command.substring(RENAME_FILE.length + 1, _idx);
      const newFilePath = command.substring(_idx + 4);

      renameFile(filePath, newFilePath);
    }

    // Add content to the file <path> content: <content>
    if (command.includes(ADD_CONTENT)) {
      const _idx = command.indexOf(" content: ");
      const filePath = command.substring(ADD_CONTENT.length + 1, _idx);
      const content = command.substring(_idx + 10);

      addContent(filePath, content);
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

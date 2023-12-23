const fsPromise = require("fs/promises");

(async () => {
  // Open the file to read data from it
  const commandFileHandler = await fsPromise.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    // Size of the file
    const fileSize = (await commandFileHandler.stat()).size;

    // Arguments of read()
    const buff = Buffer.alloc(fileSize);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    // Reading data from the file
    const fileData = await commandFileHandler.read(
      buff,
      offset,
      length,
      position
    );

    console.log(fileData.buffer.toString("utf-8"));
  });

  // Watch the file "command.txt"
  const watcher = fsPromise.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    } else {
      break;
    }
  }

  await commandFileHandler.close();

  commandFileHandler.close();
})();

let totalMemory = 0;
let memoryBlocks = [];
let fixedBlockSizes = [];
let memoryBar = document.getElementById("memoryBar");

function initializeMemory() {
  totalMemory = parseInt(document.getElementById("totalMemory").value);
  if (isNaN(totalMemory) || totalMemory <= 0) {
    alert("Please enter a valid total memory size.");
    return;
  }

  const fixedSizes = prompt(
    "Enter fixed block sizes (comma-separated, e.g., 200,300,500):"
  );
  fixedBlockSizes = fixedSizes.split(",").map(size => parseInt(size.trim()));

  const totalFixedSize = fixedBlockSizes.reduce((sum, size) => sum + size, 0);
  if (totalFixedSize > totalMemory) {
    alert("Total fixed block sizes exceed total memory. Please adjust.");
    return;
  }

  memoryBlocks = fixedBlockSizes.map(size => ({
    size: size,
    processId: null,
  }));

  updateMemoryVisualization();
}

function allocateMemory() {
  const processId = document.getElementById("processId").value;
  const processSize = parseInt(document.getElementById("processSize").value);
  const allocationMethod = document.getElementById("allocationMethod").value;

  if (!processId || isNaN(processSize) || processSize <= 0) {
    alert("Please enter valid process details.");
    return;
  }

  if (memoryBlocks.some(block => block.processId === processId)) {
    alert(`Process ID ${processId} already exists.`);
    return;
  }

  let selectedIndex = -1;

  if (allocationMethod === "bestFit") {
    let smallestFit = Infinity;
    memoryBlocks.forEach((block, index) => {
      if (block.processId === null && block.size >= processSize && block.size < smallestFit) {
        smallestFit = block.size;
        selectedIndex = index;
      }
    });
  } else if (allocationMethod === "worstFit") {
    let largestFit = -1;
    memoryBlocks.forEach((block, index) => {
      if (block.processId === null && block.size >= processSize && block.size > largestFit) {
        largestFit = block.size;
        selectedIndex = index;
      }
    });
  } else if (allocationMethod === "firstFit") {
    memoryBlocks.forEach((block, index) => {
      if (block.processId === null && block.size >= processSize && selectedIndex === -1) {
        selectedIndex = index;
      }
    });
  } else if (allocationMethod === "fixedFit") {
    memoryBlocks.forEach((block, index) => {
      if (block.processId === null && block.size >= processSize && selectedIndex === -1) {
        selectedIndex = index;
      }
    });
  }

  if (selectedIndex === -1) {
    alert("No suitable block found for allocation.");
    return;
  }
  const selectedBlock = memoryBlocks[selectedIndex];
  if (allocationMethod !== "fixedFit" && selectedBlock.size > processSize) {
    memoryBlocks.splice(selectedIndex, 1,
      { size: processSize, processId: processId },
      { size: selectedBlock.size - processSize, processId: null }
    );
  } else {
    selectedBlock.processId = processId;
  }
  updateMemoryVisualization();
}
function deallocateMemory(processId) {
  const blockIndex = memoryBlocks.findIndex(block => block.processId === processId);
  if (blockIndex === -1) {
    alert(`Process ID ${processId} not found.`);
    return;
  }

  memoryBlocks[blockIndex].processId = null;

  if (blockIndex > 0 && memoryBlocks[blockIndex - 1].processId === null) {
    memoryBlocks[blockIndex - 1].size += memoryBlocks[blockIndex].size;
    memoryBlocks.splice(blockIndex, 1);
  }
  if (blockIndex < memoryBlocks.length - 1 && memoryBlocks[blockIndex + 1].processId === null) {
    memoryBlocks[blockIndex].size += memoryBlocks[blockIndex + 1].size;
    memoryBlocks.splice(blockIndex + 1, 1);
  }
  updateMemoryVisualization();
}

function updateMemoryVisualization() {
  memoryBar.innerHTML = "";
  memoryBlocks.forEach(block => {
    const blockElement = document.createElement("div");
    blockElement.className = "memory-block";
    blockElement.textContent = block.processId ? block.processId : "Free";
    blockElement.classList.add(block.processId ? "allocated" : "free");
    blockElement.style.flex = block.size / totalMemory; // Proportional width
    blockElement.style.width = `${(block.size / totalMemory) * 100}%`;
    blockElement.style.fontSize = "0.8rem";
    blockElement.innerHTML += `<br>(${block.size}KB)`;
    memoryBar.appendChild(blockElement);
  });
}

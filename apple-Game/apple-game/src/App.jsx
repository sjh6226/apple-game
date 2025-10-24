import { useState, useEffect } from 'react'
import './App.css'
import canvasImg from './img/canvas.png'
import apple1 from './img/1.JPG'
import apple2 from './img/2.JPG'
import apple3 from './img/3.JPG'
import apple4 from './img/4.JPG'
import apple5 from './img/5.JPG'
import apple6 from './img/6.JPG'
import apple7 from './img/7.JPG'
import apple8 from './img/8.JPG'
import apple9 from './img/9.JPG'

function App() {
  const GRID_WIDTH = 17
  const GRID_HEIGHT = 10
  const [gameGrid, setGameGrid] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [selectedCells, setSelectedCells] = useState(new Set())

  const appleImages = [
    apple1, apple2, apple3, apple4, apple5,
    apple6, apple7, apple8, apple9
  ]

  // 랜덤 숫자 생성 (1-9)
  const getRandomApple = () => {
    return Math.floor(Math.random() * 9) + 1
  }

  // 드래그 시작
  const handleMouseDown = (row, col) => {
    setIsDragging(true)
    setDragStart({ row, col })
    setDragEnd({ row, col })
    setSelectedCells(new Set([`${row}-${col}`]))
  }

  // 드래그 중
  const handleMouseEnter = (row, col) => {
    if (isDragging) {
      setDragEnd({ row, col })
      updateSelectedCells({ row, col })
    }
  }

  // 선택된 셀들 업데이트
  const updateSelectedCells = (endPos) => {
    if (!dragStart) return

    const minRow = Math.min(dragStart.row, endPos.row)
    const maxRow = Math.max(dragStart.row, endPos.row)
    const minCol = Math.min(dragStart.col, endPos.col)
    const maxCol = Math.max(dragStart.col, endPos.col)

    const newSelectedCells = new Set()
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        newSelectedCells.add(`${row}-${col}`)
      }
    }
    setSelectedCells(newSelectedCells)
  }

  // 드래그 종료
  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      checkAndRemoveApples()
    }
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
    setSelectedCells(new Set())
  }

  // 선택된 영역의 합이 10인지 확인하고 사과 제거
  const checkAndRemoveApples = () => {
    let sum = 0
    const cellsToRemove = []

    selectedCells.forEach(cellKey => {
      const [row, col] = cellKey.split('-').map(Number)
      if (gameGrid[row] && gameGrid[row][col]) {
        sum += gameGrid[row][col]
        cellsToRemove.push({ row, col })
      }
    })

    if (sum === 10) {
      // 합이 10이면 해당 사과들을 제거 (0으로 설정)
      const newGrid = [...gameGrid]
      cellsToRemove.forEach(({ row, col }) => {
        newGrid[row][col] = 0
      })
      setGameGrid(newGrid)
    }
  }

  // 게임 그리드 초기화
  useEffect(() => {
    const initializeGrid = () => {
      const grid = []
      for (let row = 0; row < GRID_HEIGHT; row++) {
        const rowData = []
        for (let col = 0; col < GRID_WIDTH; col++) {
          rowData.push(getRandomApple())
        }
        grid.push(rowData)
      }
      setGameGrid(grid)
    }

    initializeGrid()
  }, [])

  return (
    <div className="game-container">
      <h1>사과 퍼즐 게임</h1>
      <p>드래그해서 숫자의 합이 정확히 10이 되는 영역을 만드세요!</p>
      <div className="game-board">
        <div className="canvas-container" onMouseUp={handleMouseUp}>
          <img src={canvasImg} alt="게임 캔버스" className="canvas-background" />
          <div className="grid-overlay">
            {gameGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="grid-row">
                {row.map((appleNumber, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`grid-cell ${selectedCells.has(`${rowIndex}-${colIndex}`) ? 'selected' : ''} ${appleNumber === 0 ? 'empty' : ''}`}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  >
                    {appleNumber > 0 && (
                      <img
                        src={appleImages[appleNumber - 1]}
                        alt={`사과 ${appleNumber}`}
                        className="apple-image"
                        draggable={false}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

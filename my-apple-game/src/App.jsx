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
  const TOTAL_APPLES = GRID_WIDTH * GRID_HEIGHT // 170개
  const TIME_LIMIT = 120 // 120초 시간 제한
  const [gameGrid, setGameGrid] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [selectedCells, setSelectedCells] = useState(new Set())
  const [score, setScore] = useState(0)
  const [isGameComplete, setIsGameComplete] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const appleImages = [
    apple1, apple2, apple3, apple4, apple5,
    apple6, apple7, apple8, apple9
  ]

  // 랜덤 숫자 생성 (1-9)
  const getRandomApple = () => {
    return Math.floor(Math.random() * 9) + 1
  }

  // 시간 포맷 함수 (mm:ss 형식)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 드래그 시작
  const handleMouseDown = (row, col) => {
    if (isTimeUp || isGameComplete) return

    setIsDragging(true)
    setDragStart({ row, col })
    setDragEnd({ row, col })
    setSelectedCells(new Set([`${row}-${col}`]))
  }

  // 드래그 중
  const handleMouseEnter = (row, col) => {
    if (isDragging && !isTimeUp && !isGameComplete) {
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
    if (isDragging && dragStart && dragEnd && !isTimeUp && !isGameComplete) {
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

      // 점수 증가 (제거된 사과 개수만큼)
      const newScore = score + cellsToRemove.length
      setScore(newScore)

      // 게임 완료 확인 (모든 사과가 제거되었는지)
      if (newScore >= TOTAL_APPLES) {
        setIsGameComplete(true)
        setGameStarted(false)
      }
    }
  }

  // 게임 그리드 초기화
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
    setScore(0)
    setIsGameComplete(false)
    setTimeLeft(TIME_LIMIT)
    setIsTimeUp(false)
    setGameStarted(true)
  }

  // 게임 재시작
  const restartGame = () => {
    initializeGrid()
  }

  useEffect(() => {
    initializeGrid()
  }, [])

  // 시간 카운트다운 타이머
  useEffect(() => {
    let timer
    if (gameStarted && timeLeft > 0 && !isGameComplete && !isTimeUp) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsTimeUp(true)
            setGameStarted(false)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [gameStarted, timeLeft, isGameComplete, isTimeUp])

  return (
    <div className="game-container">
      <h1>사과 퍼즐 게임</h1>
      <div className="game-info">
        <div className="game-stats">
          <div className="score-display">
            <span className="score-label">점수: </span>
            <span className="score-value">{score}</span>
            <span className="score-total"> / {TOTAL_APPLES}</span>
          </div>
          <div className={`timer-display ${timeLeft <= 30 ? 'warning' : ''} ${timeLeft <= 10 ? 'danger' : ''}`}>
            <span className="timer-label">남은 시간: </span>
            <span className="timer-value">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {isGameComplete && (
          <div className="game-complete">
            <h2>🎉 게임 완료! 🎉</h2>
            <p>모든 사과를 성공적으로 제거했습니다!</p>
            <p>최종 점수: {score}점</p>
            <button className="restart-button" onClick={restartGame}>
              다시 시작
            </button>
          </div>
        )}

        {isTimeUp && !isGameComplete && (
          <div className="game-over">
            <h2>⏰ 시간 종료! ⏰</h2>
            <p>시간이 다 되었습니다.</p>
            <p>최종 점수: {score}점</p>
            <button className="restart-button" onClick={restartGame}>
              Reset
            </button>
          </div>
        )}
      </div>

      {!isGameComplete && !isTimeUp && (
        <p>드래그해서 숫자의 합이 정확히 10이 되는 영역을 만드세요!</p>
      )}

      <div className="game-board">
        <div className="canvas-container" onMouseUp={handleMouseUp}>
          <img src={canvasImg} alt="게임 캔버스" className="canvas-background" />
          <div className="grid-overlay">
            {gameGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="grid-row">
                {row.map((appleNumber, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`grid-cell ${selectedCells.has(`${rowIndex}-${colIndex}`) ? 'selected' : ''} ${appleNumber === 0 ? 'empty' : ''} ${(isTimeUp || isGameComplete) ? 'disabled' : ''}`}
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

      {!isGameComplete && !isTimeUp && (
        <button className="restart-button" onClick={restartGame}>
          게임 재시작
        </button>
      )}
    </div>
  )
}

export default App

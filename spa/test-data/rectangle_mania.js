let horizontalLines = {}

function rectangleMania(coords){
    let xToY = {}
    let yToX = {}
    console.log(coords)
    getSearchablecoords(coords, xToY, yToX)
    console.log(xToY)
    console.log(yToX)
   
    let rectangles = {}

    coords.forEach((e) => {
        
        

    })
}

function getSearchablecoords(coords, xToY, yToX){
    coords.forEach((e) => {
        console.log(e)
        if(xToY[e[0]] == null){
            xToY[e[0]] = {}
            xToY[e[0]][e[1]] = true
        }else{
            xToY[e[0]][e[1]] = true
        }

        if(yToX[e[1]] == null){
            yToX[e[1]] = {
                [e[0]]: true
            }
            
        }else{
            yToX[e[1]][e[0]] = true
        }
    })
}

function getCoordText(coord){
    return `${coord[0]},${coord[1]}`
}


let coords = [[0, 0], [0, 1], [1, 1], [1, 0], [2, 1], [2, 0],[3, 1], [3, 0]]
rectangleMania(coords)

exports.rectangleMania = rectangleMania
export function matrix_x_vector(matrix, vector) {
    const [n, m] = [matrix.length, matrix[0].length];

    if (vector.length !== m) {
        throw new Error("Matrix and vector dimensions do not match.");
    }

    const output = [];

    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < m; j++) {
            sum += matrix[i][j] * vector[j];
        }
        output.push(sum);
    }
    
    return output;
}

export function vector_p_vector(vector1, vector2) {
    const [n, m] = [vector1.length, vector2.length];

    if (n !== m) {
        throw new Error("Vector dimensions do not match.");
    }

    const output = [];

    for (let i = 0; i < n; i++) {
        output.push(vector1[i] + vector2[i]);
    }
    
    return output;
}
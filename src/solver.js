/** Solves a system of linear equations.

t1 = (a * r1) + (b + s1) + c
t2 = (a * r2) + (b + s2) + c
t3 = (a * r3) + (b + s3) + c

r1 - t3 are the known values.
a, b, c are the unknowns to be solved.
returns the a, b, c coefficients.
*/
module.exports = function linearSolution(r1, s1, t1, r2, s2, t2, r3, s3, t3){
    // make them all floats
    r1 = parseFloat(r1);
    s1 = parseFloat(s1);
    t1 = parseFloat(t1);
    r2 = parseFloat(r2);
    s2 = parseFloat(s2);
    t2 = parseFloat(t2);
    r3 = parseFloat(r3);
    s3 = parseFloat(s3);
    t3 = parseFloat(t3);

    var a = (((t2 - t3) * (s1 - s2)) - ((t1 - t2) * (s2 - s3))) / (((r2 - r3) * (s1 - s2)) - ((r1 - r2) * (s2 - s3)));
    var b = (((t2 - t3) * (r1 - r2)) - ((t1 - t2) * (r2 - r3))) / (((s2 - s3) * (r1 - r2)) - ((s1 - s2) * (r2 - r3)));
    var c = t1 - (r1 * a) - (s1 * b);

    return [a, b, c];
}
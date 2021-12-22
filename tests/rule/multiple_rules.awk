BEGIN {
    a = 1
}
{func()}
/abc/ {
}

END {
    b = 1; c = a + 2
}

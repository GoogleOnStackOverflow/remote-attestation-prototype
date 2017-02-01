#include <stdlib.h>
#include <stdio.h>

static int aa = 1;

int foo1(){
	return 1;
}

int foo2(){
	return 2;
}

int foo3(){
	return foo2() + 1;
}

int main(){
        int* bb  = malloc(sizeof(int));
        *bb = 2;
        int cc = 3;

        aa = foo1();
        cc = foo3();

        while(1);
};
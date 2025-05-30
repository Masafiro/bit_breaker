/*
    - 問題のインスタンスを与えると，幅優先探索を用いて最小手数の解法を返すソルバーです．
    
    - 問題のインスタンスは，次の要素からなります．
        - 扱う値のビット長 (n : 非負整数)
        - 最初の値 (start : n桁の2進数)
        - 目標の値 (target : n桁の2進数)
        - 与える操作の種類数 (m : 非負整数)
        - 操作 (1つの操作を文字列と2進数の非負整数の組で与える)
    
    - solverは，正しい操作列が存在すればそのうち長さが最小のものを，操作の番号の列として返します．
    - 変数 turn_limit が与えられており，solverは幅優先探索の深さが turn_limit 以上になると
    それ以上の探索を打ち切って空の列を返します．

    - kをn桁の2進数として，次のような操作に対応しています．
        - and k     : 今の値にkをandした値を返す 
        - or k      : 今の値にkをorした値を返す
        - xor k     : 今の値にkをxorした値を返す
        - not       : 今の値の各bitを反転した値を返す
        - lshift    : 今の値を左shiftして2^nで割った値を返す
        - cyclic_lshift : 今の値を巡回左shiftした値を返す
        - rshift    : 今の値を右shiftした値を返す
        - cyclic_rshift : 今の値を巡回右shiftした値を返す
        - add k : 今の値にkを足して2^nで割った値を返す

    < 例 > 
        5  // ビット列の長さ
        00011 // 初期値
        10101 // 目標値
        4 // 操作の種類数
        xor 10011 
        or 10001
        cyclic_lshift
        not

        // 結果
        1: operation 3
        2: operation 1

        // 00011に3番目の操作(cyclic_lshift)をした後に1番目の操作(xor 10011)をすると最速で10101が得られる

*/

#include <vector>
#include <queue>
#include <iostream>
#include <set>
using namespace std;


vector<int> solver(int n, int m, unsigned int start, unsigned int target,
    vector<pair<string,unsigned int>> &operation, set<int> &counted, int turn_limit){
    queue<pair<unsigned int, vector<int>>> que;
    vector<int> initial;
    que.push(make_pair(start, initial));
    vector<int> answer;
    while(que.size()){
        auto pr = que.front();
        que.pop();

        if(pr.first == target){
            answer = pr.second;
            break;
        }

        if(pr.second.size() >= turn_limit) break;
        counted.insert(pr.first);
        if(!counted.count(pr.first))continue;

        for(int i = 0; i < m; i++){
            int now = pr.first;
            if(operation[i].first == "and"){
                now &= operation[i].second;
                if(!counted.count(now)){
                    pr.second.push_back(i+1);
                    que.push(make_pair(now, pr.second));
                    pr.second.pop_back();
                }
                now = pr.first;
            }
            
            if(operation[i].first == "or"){
                now |= operation[i].second;
                if(!counted.count(now)){
                    pr.second.push_back(i+1);
                    que.push(make_pair(now, pr.second));
                    pr.second.pop_back();
                }
                now = pr.first;
            }
            
            if(operation[i].first == "xor"){
                now ^= operation[i].second;
                if(!counted.count(now)){
                    pr.second.push_back(i+1);
                    que.push(make_pair(now, pr.second));
                    pr.second.pop_back();
                }
                now = pr.first;
            }
           
            if(operation[i].first == "not"){
                now = (1<<n) - 1 - now;
                if(!counted.count(now)){
                    pr.second.push_back(i+1);
                    que.push(make_pair(now, pr.second));
                    pr.second.pop_back();
                }
                now = pr.first;
            }

            if(operation[i].first == "lshift"){
                unsigned int dec = 0;
                if((now >> (n - 1)) & 1) dec = (1 << n);
                now *= 2;
                now -= dec;
                if(!counted.count(now)){
                    pr.second.push_back(i+1);
                    que.push(make_pair(now, pr.second));
                    pr.second.pop_back();
                }
                now = pr.first;
            }

            if(operation[i].first == "cyclic_lshift"){
                unsigned int dec = 0;
                if((now >> (n - 1)) & 1) dec = (1 << n) - 1;
                now *= 2;
                now -= dec;
                if(!counted.count(now)){
                    pr.second.push_back(i+1);
                    que.push(make_pair(now, pr.second));
                    pr.second.pop_back();
                }
                now = pr.first;
            }
            
            if(operation[i].first == "rshift"){
                now = now >> 1;
                if(!counted.count(now)){
                    pr.second.push_back(i+1);
                    que.push(make_pair(now, pr.second));
                    pr.second.pop_back();
                }
                now = pr.first;
            }
            
            if(operation[i].first == "cyclic_rshift"){
                unsigned int inc = 0;
                if(now & 1) inc = (1 << (n - 1)); 
                now = now >> 1;
                now += inc;
                if(!counted.count(now)){
                    pr.second.push_back(i+1);
                    que.push(make_pair(now, pr.second));
                    pr.second.pop_back();
                }
                now = pr.first;
            }
            
            if(operation[i].first == "add"){
                now += operation[i].second;
                now %= (1 << n);
                if(!counted.count(now)){
                    pr.second.push_back(i+1);
                    que.push(make_pair(now, pr.second));
                    pr.second.pop_back();
                }
            }
            
        }
    }
    return answer;

}

int main(){
    int n;
    unsigned int start;
    int m;
    unsigned int target;
    vector<pair<string,unsigned int>> operation;
    set<int> counted;

    cin >> n;
    string input_start;
    cin >> input_start;
    start = stoul(input_start, nullptr, 2);
    string input_target;
    cin >> input_target;
    target = stoul(input_target, nullptr, 2);
    cin >> m;
    operation.resize(m); 
    vector<string> more_information = {"and", "or", "xor", "add"};
    for(int i = 0; i < m ; i++){
        cin>>operation[i].first;
        for(string oper : more_information){
            if(operation[i].first == oper){
                string input;
                cin >> input;
                unsigned int value = stoul(input, nullptr, 2);
                operation[i].second = value;
                break;
            }
        }
    }

    int turn_limit = 10;

    vector<int> answer = solver(n, m, start, target, operation, counted, turn_limit);
    int sz = answer.size();
    for(int i = 0; i < sz; i++){
        cout << (i+1) << ": operation " << answer[i] <<endl;
    }
    return 0;
}
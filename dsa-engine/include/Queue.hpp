#ifndef QUEUE_HPP
#define QUEUE_HPP

#include <vector>
#include <stdexcept>

template <typename T>
class CustomQueue {
private:
    struct Node {
        T data;
        Node* next;
        Node(T val) : data(val), next(nullptr) {}
    };

    Node* frontNode;
    Node* rearNode;
    size_t count;

public:
    CustomQueue() : frontNode(nullptr), rearNode(nullptr), count(0) {}

    ~CustomQueue() {
        while (!empty()) {
            pop();
        }
    }

    void push(const T& val) {
        Node* newNode = new Node(val);
        if (!rearNode) {
            frontNode = rearNode = newNode;
        } else {
            rearNode->next = newNode;
            rearNode = newNode;
        }
        count++;
    }

    void pop() {
        if (empty()) throw std::runtime_error("Queue is empty");
        Node* temp = frontNode;
        frontNode = frontNode->next;
        if (!frontNode) rearNode = nullptr;
        delete temp;
        count--;
    }

    T front() const {
        if (empty()) throw std::runtime_error("Queue is empty");
        return frontNode->data;
    }

    bool empty() const { return count == 0; }
    size_t size() const { return count; }
};

#endif

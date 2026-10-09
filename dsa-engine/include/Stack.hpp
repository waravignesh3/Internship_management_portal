#ifndef STACK_HPP
#define STACK_HPP

#include <vector>
#include <stdexcept>

template <typename T>
class CustomStack {
private:
    std::vector<T> elements;

public:
    CustomStack() {}

    void push(const T& val) {
        elements.push_back(val);
    }

    void pop() {
        if (empty()) throw std::runtime_error("Stack is empty");
        elements.pop_back();
    }

    T top() const {
        if (empty()) throw std::runtime_error("Stack is empty");
        return elements.back();
    }

    bool empty() const { return elements.empty(); }
    size_t size() const { return elements.size(); }
    void clear() { elements.clear(); }
};

#endif

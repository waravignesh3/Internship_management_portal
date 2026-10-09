#ifndef PRIORITYQUEUE_HPP
#define PRIORITYQUEUE_HPP

#include <vector>
#include <stdexcept>

template <typename T, typename Comparator = std::less<T>>
class CustomPriorityQueue {
private:
    std::vector<T> heap;
    Comparator comp;

    void heapifyUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (comp(heap[parent], heap[index])) {
                std::swap(heap[parent], heap[index]);
                index = parent;
            } else {
                break;
            }
        }
    }

    void heapifyDown(int index) {
        int size = heap.size();
        while (index < size) {
            int left = 2 * index + 1;
            int right = 2 * index + 2;
            int largest = index;

            if (left < size && comp(heap[largest], heap[left])) {
                largest = left;
            }
            if (right < size && comp(heap[largest], heap[right])) {
                largest = right;
            }

            if (largest != index) {
                std::swap(heap[index], heap[largest]);
                index = largest;
            } else {
                break;
            }
        }
    }

public:
    CustomPriorityQueue() {}

    void push(const T& val) {
        heap.push_back(val);
        heapifyUp(heap.size() - 1);
    }

    T top() const {
        if (heap.empty()) throw std::runtime_error("PriorityQueue is empty");
        return heap[0];
    }

    void pop() {
        if (heap.empty()) throw std::runtime_error("PriorityQueue is empty");
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) {
            heapifyDown(0);
        }
    }

    bool empty() const { return heap.empty(); }
    size_t size() const { return heap.size(); }
};

#endif

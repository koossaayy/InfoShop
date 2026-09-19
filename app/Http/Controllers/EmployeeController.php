<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use App\Models\User;
use App\Models\Store;

class EmployeeController extends Controller
{
    public function getEmployees($filters)
    {
        $query = Employee::query();
        $query = $query->orderBy('id', 'desc');

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('joined_at', [$filters['start_date'], $filters['end_date']]);
        }

        if (!empty($filters['search_query'])) {
            $query->where('name', 'like', "%{$filters['search_query']}%");
        }

        $results = $query->paginate(100);
        $results->appends($filters);
        return $results;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['start_date', 'end_date', 'search_query']);
        $employees = $this->getEmployees($filters);
        $stores = Store::select('id', 'name')->get();

        return Inertia::render('Employee/Employee', [
            'employees' => $employees,
            'stores' => $stores,
            'pageLabel' => __('Employees'),
        ]);
    }

    public function store(Request $request)
    {
        $employee = new Employee();
        $employee->name = $request->name;
        $employee->contact_number = $request->contact_number;
        $employee->address = $request->address;
        $employee->joined_at = $request->joined_at;
        $employee->salary = $request->salary;
        $employee->salary_frequency = $request->salary_frequency;
        $employee->role = $request->role;
        $employee->status = $request->status;
        $employee->gender = $request->gender;
        $employee->store_id = $request->store_id;
        $employee->balance = 0;
        $employee->save();

        return response()->json([
            'message' => "Employee added successfully",
        ], 200);
    }

    public function update(Request $request, $id)
    {
        // Validate the incoming request data
        $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:15',
            'address' => 'required|string|max:255',
            'joined_at' => 'required|date',
            'salary' => 'required|numeric',
            'salary_frequency' => 'required|string',
            'role' => 'required|string|max:255',
            'status' => 'required|string|in:Active,Inactive',
            'gender' => 'required|string|in:Male,Female',
            'store_id' => 'required|integer|exists:stores,id',
        ]);

        // Find the employee by ID
        $employee = Employee::findOrFail($id);

        // Update the employee's attributes
        $employee->name = $request->name;
        $employee->contact_number = $request->contact_number;
        $employee->address = $request->address;
        $employee->joined_at = $request->joined_at;
        $employee->salary = $request->salary;
        $employee->salary_frequency = $request->salary_frequency;
        $employee->role = $request->role;
        $employee->status = $request->status;
        $employee->gender = $request->gender;
        $employee->store_id = $request->store_id;

        // Save the updated employee record
        $employee->save();

        return response()->json([
            'message' => "Employee updated successfully",
        ], 200);
    }

    public function delete($id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $employee->delete();

        return response()->json(['message' => 'Employee deleted successfully'], 200);
    }
}

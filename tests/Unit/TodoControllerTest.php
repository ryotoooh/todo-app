<?php

namespace Tests\Unit;

use App\Http\Controllers\TodoController;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Mockery;
use PHPUnit\Framework\TestCase;

#[\PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses]
#[\PHPUnit\Framework\Attributes\PreserveGlobalState(false)]
class TodoControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $container = new \Illuminate\Container\Container();
        \Illuminate\Container\Container::setInstance($container);

        $factory = \Mockery::mock(\Illuminate\Contracts\Routing\ResponseFactory::class);
        $factory->shouldReceive('json')->andReturnUsing(
            function ($data = [], $status = 200, array $headers = [], $options = 0) {
                return new \Illuminate\Http\JsonResponse($data, $status, $headers, $options);
            }
        );

        $container->instance(\Illuminate\Contracts\Routing\ResponseFactory::class, $factory);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_index_returns_todos_as_json(): void
    {
        $todoAlias = Mockery::mock('alias:' . Todo::class);
        $todoAlias->shouldReceive('orderBy')->once()
            ->with('created_at', 'desc')
            ->andReturnSelf();
        $expected = [
            ['id' => 2, 'title' => 'B', 'description' => null, 'is_done' => false],
            ['id' => 1, 'title' => 'A', 'description' => 'desc', 'is_done' => true],
        ];
        $todoAlias->shouldReceive('get')->once()->andReturn($expected);

        $controller = new TodoController();

        $response = $controller->index();

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame($expected, $response->getData(true));
    }

    public function test_store_validates_and_creates_todo(): void
    {
        $data = [
            'title' => 'New Todo',
            'description' => 'Something to do',
            'is_done' => true,
        ];

        $request = Mockery::mock(Request::class);
        $request->shouldReceive('validate')->once()->andReturn($data);
        $request->shouldReceive('all')->atLeast()->once()->andReturn($data);
        $request->shouldReceive('__get')->with('title')->andReturn($data['title']);
        $request->shouldReceive('__get')->with('description')->andReturn($data['description']);
        $request->shouldReceive('__get')->with('is_done')->andReturn($data['is_done']);

        $created = ['id' => 10] + $data;

        $todoAlias = Mockery::mock('alias:' . Todo::class);
        $todoAlias->shouldReceive('create')->once()->with($data)->andReturn($created);

        $controller = new TodoController();

        $response = $controller->store($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame($created, $response->getData(true));
    }

    public function test_show_returns_single_todo_as_json(): void
    {
        $todo = new Todo();
        $todo->setAttribute('id', 5);
        $todo->setAttribute('title', 'Read');
        $todo->setAttribute('description', null);
        $todo->setAttribute('is_done', false);

        $controller = new TodoController();

        $response = $controller->show($todo);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());

        $data = $response->getData(true);
        $this->assertSame(5, $data['id']);
        $this->assertSame('Read', $data['title']);
        $this->assertArrayHasKey('is_done', $data);
    }

    public function test_update_validates_and_updates_todo(): void
    {
        $validated = [
            'title' => 'Updated',
            'description' => 'Changed',
            'is_done' => true,
        ];

        $request = Mockery::mock(Request::class);
        $request->shouldReceive('validate')->once()->andReturn($validated);
        $request->shouldReceive('only')->once()
            ->with(['title', 'description', 'is_done'])
            ->andReturn($validated);

        $todo = Mockery::mock(Todo::class)->makePartial();
        $todo->setAttribute('id', 7);
        $todo->shouldReceive('update')->once()->with($validated)->andReturnTrue();

        // Simulate that attributes were updated so JSON reflects new state
        $todo->setAttribute('title', $validated['title']);
        $todo->setAttribute('description', $validated['description']);
        $todo->setAttribute('is_done', $validated['is_done']);

        $controller = new TodoController();

        $response = $controller->update($request, $todo);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());

        $data = $response->getData(true);
        $this->assertSame(7, $data['id']);
        $this->assertSame('Updated', $data['title']);
        $this->assertTrue($data['is_done']);
    }

    public function test_destroy_deletes_todo_and_returns_message(): void
    {
        $todo = Mockery::mock(Todo::class);
        $todo->shouldReceive('delete')->once()->andReturnTrue();

        $controller = new TodoController();

        $response = $controller->destroy($todo);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame(
            ['message' => 'Todo deleted successfully'],
            $response->getData(true)
        );
    }
}
